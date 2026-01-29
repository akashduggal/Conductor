from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.job import TrainingJob
from app.schemas.job import TrainingJobResponse

router = APIRouter()


@router.get("/{job_id}", response_model=TrainingJobResponse)
async def get_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TrainingJob).where(TrainingJob.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return TrainingJobResponse(
        id=job.id,
        experiment_id=job.experiment_id,
        status=job.status,
        progress=float(job.progress),
        current_epoch=job.current_epoch,
        total_epochs=job.total_epochs,
        logs=job.logs,
        error_message=job.error_message,
        started_at=job.started_at,
        completed_at=job.completed_at,
        created_at=job.created_at,
        avg_epoch_time=float(job.avg_epoch_time) if job.avg_epoch_time else None,
        estimated_completion=job.estimated_completion,
    )
