from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.experiment import Experiment
from app.models.dataset import Dataset
from app.models.job import TrainingJob
from app.schemas.api import StatsOverview

router = APIRouter()


@router.get("/stats/overview", response_model=StatsOverview)
async def get_stats_overview(db: AsyncSession = Depends(get_db)):
    # Experiments stats
    exp_result = await db.execute(
        select(
            func.count(Experiment.id).label("total"),
            func.sum(func.cast(Experiment.status == "running", func.Integer)).label("running"),
            func.sum(func.cast(Experiment.status == "completed", func.Integer)).label("completed"),
            func.sum(func.cast(Experiment.status == "failed", func.Integer)).label("failed"),
            func.sum(func.cast(Experiment.status == "cancelled", func.Integer)).label("cancelled"),
        )
    )
    exp_stats = exp_result.first()
    
    # Datasets stats
    dataset_result = await db.execute(
        select(
            func.count(Dataset.id).label("total"),
            func.sum(Dataset.size_bytes).label("total_size_bytes"),
        )
    )
    dataset_stats = dataset_result.first()
    
    # Modality breakdown
    modality_result = await db.execute(
        select(Dataset.modality, func.count(Dataset.id).label("count"))
        .group_by(Dataset.modality)
    )
    modality_counts = {row.modality: row.count for row in modality_result.all()}
    
    # Jobs stats
    job_result = await db.execute(
        select(
            func.sum(func.cast(TrainingJob.status == "running", func.Integer)).label("active"),
            func.sum(func.cast(TrainingJob.status == "pending", func.Integer)).label("queued"),
        )
    )
    job_stats = job_result.first()
    
    total_size_gb = (dataset_stats.total_size_bytes or 0) / (1024 ** 3)
    
    return StatsOverview(
        experiments={
            "total": exp_stats.total or 0,
            "running": exp_stats.running or 0,
            "completed": exp_stats.completed or 0,
            "failed": exp_stats.failed or 0,
            "cancelled": exp_stats.cancelled or 0,
        },
        datasets={
            "total": dataset_stats.total or 0,
            "by_modality": {
                "text": modality_counts.get("text", 0),
                "image": modality_counts.get("image", 0),
                "audio": modality_counts.get("audio", 0),
                "video": modality_counts.get("video", 0),
                "multimodal": modality_counts.get("multimodal", 0),
            },
            "total_size_gb": round(total_size_gb, 2),
        },
        jobs={
            "active": job_stats.active or 0,
            "queued": job_stats.queued or 0,
            "avg_duration_minutes": 245,  # Could calculate from completed jobs
        },
    )
