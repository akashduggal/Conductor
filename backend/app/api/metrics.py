from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from datetime import datetime
import json
from app.database import get_db
from app.models.metric import Metric
from app.models.job import TrainingJob
from app.schemas.metric import MetricResponse, MetricsResponse, MetricSummary, MetricUpdate
from app.services.training import TrainingService

router = APIRouter()


@router.get("/jobs/{job_id}/metrics", response_model=MetricsResponse)
async def get_job_metrics(
    job_id: str,
    start_epoch: Optional[int] = Query(0),
    end_epoch: Optional[int] = Query(None),
    step: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db),
):
    # Verify job exists
    job_result = await db.execute(select(TrainingJob).where(TrainingJob.id == job_id))
    job = job_result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Build query
    query = select(Metric).where(Metric.job_id == job_id)
    
    if start_epoch is not None:
        query = query.where(Metric.epoch >= start_epoch)
    if end_epoch is not None:
        query = query.where(Metric.epoch <= end_epoch)
    
    query = query.order_by(Metric.epoch, Metric.step)
    
    result = await db.execute(query)
    all_metrics = result.scalars().all()
    
    # Apply step sampling
    metrics = [all_metrics[i] for i in range(0, len(all_metrics), step)]
    
    # Calculate summary
    if metrics:
        losses = [float(m.loss) for m in metrics]
        accuracies = [float(m.accuracy) for m in metrics if m.accuracy is not None]
        
        summary = MetricSummary(
            total_points=len(all_metrics),
            returned_points=len(metrics),
            best_loss=min(losses),
            best_accuracy=max(accuracies) if accuracies else 0.0,
            current_loss=losses[-1],
            current_accuracy=accuracies[-1] if accuracies else 0.0,
        )
    else:
        summary = MetricSummary(
            total_points=0,
            returned_points=0,
            best_loss=0.0,
            best_accuracy=0.0,
            current_loss=0.0,
            current_accuracy=0.0,
        )
    
    metric_responses = [
        MetricResponse(
            id=m.id,
            job_id=m.job_id,
            epoch=m.epoch,
            step=m.step,
            loss=float(m.loss),
            accuracy=float(m.accuracy) if m.accuracy else None,
            learning_rate=float(m.learning_rate) if m.learning_rate else None,
            throughput=float(m.throughput) if m.throughput else None,
            gpu_utilization=float(m.gpu_utilization) if m.gpu_utilization else None,
            memory_used_gb=float(m.memory_used_gb) if m.memory_used_gb else None,
            custom_metrics=m.custom_metrics,
            timestamp=m.timestamp,
        )
        for m in metrics
    ]
    
    return MetricsResponse(
        job_id=job_id,
        metrics=metric_responses,
        summary=summary,
    )


@router.websocket("/jobs/{job_id}/metrics/stream")
async def websocket_metrics_stream(
    websocket: WebSocket,
    job_id: str,
):
    await websocket.accept()
    
    try:
        # Get training service instance
        training_service = TrainingService()
        
        # Subscribe to metric updates for this job
        async def send_update(update: dict):
            try:
                await websocket.send_json(update)
            except Exception as e:
                print(f"Error sending update: {e}")
        
        # Register callback
        training_service.subscribe_to_job(job_id, send_update)
        
        # Keep connection alive and forward updates
        while True:
            try:
                # Wait for client messages (ping/pong) or disconnect
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"WebSocket error: {e}")
                break
    except Exception as e:
        print(f"WebSocket connection error: {e}")
    finally:
        training_service.unsubscribe_from_job(job_id)
        try:
            await websocket.close()
        except:
            pass
