from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from supabase import Client
from typing import Optional, List
from app.supabase_client import get_supabase
from app.schemas.metric import MetricResponse, MetricsResponse, MetricSummary
from app.services.training import TrainingService

router = APIRouter()


@router.get("/jobs/{job_id}/metrics", response_model=MetricsResponse)
def get_job_metrics(
    job_id: str,
    start_epoch: Optional[int] = Query(0),
    end_epoch: Optional[int] = Query(None),
    step: int = Query(1, ge=1),
    supabase: Client = Depends(get_supabase),
):
    job_res = supabase.table("training_jobs").select("id").eq("id", job_id).maybe_single().execute()
    if not job_res.data:
        raise HTTPException(status_code=404, detail="Job not found")

    q = supabase.table("metrics").select("*").eq("job_id", job_id).gte("epoch", start_epoch).order("epoch").order("step")
    if end_epoch is not None:
        q = q.lte("epoch", end_epoch)
    res = q.execute()
    all_rows = res.data or []

    metrics_sampled = [all_rows[i] for i in range(0, len(all_rows), step)]

    if metrics_sampled:
        losses = [float(m["loss"]) for m in metrics_sampled]
        accuracies = [float(m["accuracy"]) for m in metrics_sampled if m.get("accuracy") is not None]
        summary = MetricSummary(
            total_points=len(all_rows),
            returned_points=len(metrics_sampled),
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
            id=m.get("id"),
            job_id=m["job_id"],
            epoch=m["epoch"],
            step=m["step"],
            loss=float(m["loss"]),
            accuracy=float(m["accuracy"]) if m.get("accuracy") is not None else None,
            learning_rate=float(m["learning_rate"]) if m.get("learning_rate") is not None else None,
            throughput=float(m["throughput"]) if m.get("throughput") is not None else None,
            gpu_utilization=float(m["gpu_utilization"]) if m.get("gpu_utilization") is not None else None,
            memory_used_gb=float(m["memory_used_gb"]) if m.get("memory_used_gb") is not None else None,
            custom_metrics=m.get("custom_metrics"),
            timestamp=m.get("timestamp"),
        )
        for m in metrics_sampled
    ]

    return MetricsResponse(job_id=job_id, metrics=metric_responses, summary=summary)


@router.websocket("/jobs/{job_id}/metrics/stream")
async def websocket_metrics_stream(
    websocket: WebSocket,
    job_id: str,
):
    await websocket.accept()
    training_service = TrainingService()
    async def send_update(update: dict):
        try:
            await websocket.send_json(update)
        except Exception as e:
            print(f"Error sending update: {e}")
    training_service.subscribe_to_job(job_id, send_update)
    try:
        while True:
            try:
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
        except Exception:
            pass
