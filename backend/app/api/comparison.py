from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.experiment import Experiment
from app.models.metric import Metric
from app.schemas.api import ComparisonRequest, ComparisonResponse, ComparisonData

router = APIRouter()


@router.post("/experiments/compare", response_model=ComparisonResponse)
async def compare_experiments(
    request: ComparisonRequest,
    db: AsyncSession = Depends(get_db),
):
    comparison_data = []
    
    for exp_id in request.experiment_ids:
        # Get experiment
        exp_result = await db.execute(
            select(Experiment).where(Experiment.id == exp_id)
        )
        experiment = exp_result.scalar_one_or_none()
        
        if not experiment:
            raise HTTPException(
                status_code=404,
                detail=f"Experiment {exp_id} not found",
            )
        
        # Get latest job
        from app.models.job import TrainingJob
        job_result = await db.execute(
            select(TrainingJob)
            .where(TrainingJob.experiment_id == exp_id)
            .order_by(TrainingJob.created_at.desc())
            .limit(1)
        )
        job = job_result.scalar_one_or_none()
        
        if not job:
            continue
        
        # Get metrics for this job
        metrics_result = await db.execute(
            select(Metric)
            .where(Metric.job_id == job.id)
            .order_by(Metric.epoch, Metric.step)
        )
        metrics = metrics_result.scalars().all()
        
        # Build metrics data
        metrics_dict = {}
        for metric_name in request.metrics:
            values = []
            data_points = []
            
            for m in metrics:
                value = getattr(m, metric_name, None)
                if value is not None:
                    values.append(float(value))
                    data_points.append({
                        "epoch": m.epoch,
                        "value": float(value),
                    })
            
            if values:
                metrics_dict[metric_name] = {
                    "min": min(values),
                    "max": max(values),
                    "final": values[-1],
                    "data_points": data_points,
                }
        
        comparison_data.append(
            ComparisonData(
                experiment_id=exp_id,
                name=experiment.name,
                config={
                    "batch_size": experiment.config["hyperparameters"]["batch_size"],
                    "learning_rate": experiment.config["hyperparameters"]["learning_rate"],
                },
                metrics=metrics_dict,
            )
        )
    
    return ComparisonResponse(comparison=comparison_data)
