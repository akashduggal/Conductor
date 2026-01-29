from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models.experiment import Experiment
from app.models.job import TrainingJob
from app.models.dataset import Dataset
from app.schemas.experiment import (
    ExperimentCreate,
    ExperimentResponse,
    ExperimentListResponse,
    JobStartResponse,
    JobCancelResponse,
)
from app.services.training import TrainingService

router = APIRouter()


@router.get("", response_model=ExperimentListResponse)
async def get_experiments(
    status: Optional[str] = Query(None),
    dataset_id: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query("created_at"),
    order: Optional[str] = Query("desc"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Experiment).options(
        selectinload(Experiment.training_jobs),
        selectinload(Experiment.dataset),
    )
    
    if status:
        query = query.where(Experiment.status == status)
    if dataset_id:
        query = query.where(Experiment.dataset_id == dataset_id)
    
    # Get total count
    count_query = select(func.count()).select_from(Experiment)
    if status:
        count_query = count_query.where(Experiment.status == status)
    if dataset_id:
        count_query = count_query.where(Experiment.dataset_id == dataset_id)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply sorting
    if sort_by == "name":
        order_by_col = Experiment.name
    else:
        order_by_col = Experiment.created_at
    
    if order == "asc":
        query = query.order_by(order_by_col.asc())
    else:
        query = query.order_by(order_by_col.desc())
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    experiments = result.scalars().all()
    
    experiment_responses = []
    for exp in experiments:
        current_job = None
        if exp.training_jobs:
            latest_job = max(exp.training_jobs, key=lambda j: j.created_at)
            if latest_job.status == "running":
                current_job = {
                    "id": latest_job.id,
                    "progress": float(latest_job.progress),
                    "current_epoch": latest_job.current_epoch,
                    "latest_metrics": {},  # Could fetch from metrics table
                }
        
        dataset_name = exp.dataset.name if exp.dataset else None
        exp_dict = {
            "id": exp.id,
            "name": exp.name,
            "description": exp.description,
            "dataset_id": exp.dataset_id,
            "status": exp.status,
            "config": exp.config,
            "created_by": exp.created_by,
            "created_at": exp.created_at,
            "started_at": exp.started_at,
            "completed_at": exp.completed_at,
            "tags": exp.tags or [],
            "dataset_name": dataset_name,
            "current_job": current_job,
            "training_jobs": None,
        }
        experiment_responses.append(ExperimentResponse(**exp_dict))
    
    return ExperimentListResponse(
        data=experiment_responses,
        pagination={
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        },
    )


@router.get("/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment(
    experiment_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Experiment)
        .options(
            selectinload(Experiment.training_jobs),
            selectinload(Experiment.dataset),
        )
        .where(Experiment.id == experiment_id)
    )
    experiment = result.scalar_one_or_none()
    
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    current_job = None
    if experiment.training_jobs:
        latest_job = max(experiment.training_jobs, key=lambda j: j.created_at)
        if latest_job.status == "running":
            current_job = {
                "id": latest_job.id,
                "progress": float(latest_job.progress),
                "current_epoch": latest_job.current_epoch,
                "latest_metrics": {},
            }
    
    dataset_name = experiment.dataset.name if experiment.dataset else None
    return ExperimentResponse(
        id=experiment.id,
        name=experiment.name,
        description=experiment.description,
        dataset_id=experiment.dataset_id,
        status=experiment.status,
        config=experiment.config,
        created_by=experiment.created_by,
        created_at=experiment.created_at,
        started_at=experiment.started_at,
        completed_at=experiment.completed_at,
        tags=experiment.tags or [],
        dataset_name=dataset_name,
        current_job=current_job,
        training_jobs=None,
    )


@router.post("", response_model=ExperimentResponse, status_code=201)
async def create_experiment(
    experiment: ExperimentCreate,
    db: AsyncSession = Depends(get_db),
):
    db_experiment = Experiment(**experiment.model_dump())
    db.add(db_experiment)
    await db.commit()
    await db.refresh(db_experiment)
    dataset_name = None
    if db_experiment.dataset_id:
        ds_result = await db.execute(select(Dataset).where(Dataset.id == db_experiment.dataset_id))
        ds = ds_result.scalar_one_or_none()
        if ds:
            dataset_name = ds.name
    return ExperimentResponse(
        id=db_experiment.id,
        name=db_experiment.name,
        description=db_experiment.description,
        dataset_id=db_experiment.dataset_id,
        status=db_experiment.status,
        config=db_experiment.config,
        created_by=db_experiment.created_by,
        created_at=db_experiment.created_at,
        started_at=db_experiment.started_at,
        completed_at=db_experiment.completed_at,
        tags=db_experiment.tags or [],
        dataset_name=dataset_name,
        current_job=None,
        training_jobs=None,
    )


@router.post("/{experiment_id}/start", response_model=JobStartResponse)
async def start_experiment(
    experiment_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = result.scalar_one_or_none()
    
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    if experiment.status not in ["created", "queued"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start experiment with status: {experiment.status}",
        )
    
    # Create training job
    job = TrainingJob(
        experiment_id=experiment.id,
        status="pending",
        total_epochs=experiment.config["hyperparameters"]["num_epochs"],
    )
    db.add(job)
    
    experiment.status = "queued"
    experiment.started_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(job)
    
    # Start background training
    training_service = TrainingService()
    await training_service.start_training(job.id, experiment.config, db)
    
    return JobStartResponse(
        experiment_id=experiment.id,
        job_id=job.id,
        status="queued",
        message="Training job queued successfully",
    )


@router.post("/{experiment_id}/cancel", response_model=JobCancelResponse)
async def cancel_experiment(
    experiment_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Experiment)
        .options(selectinload(Experiment.training_jobs))
        .where(Experiment.id == experiment_id)
    )
    experiment = result.scalar_one_or_none()
    
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    if experiment.status not in ["queued", "running"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel experiment with status: {experiment.status}",
        )
    
    experiment.status = "cancelled"
    experiment.completed_at = datetime.utcnow()
    
    # Cancel running jobs
    for job in experiment.training_jobs:
        if job.status == "running":
            job.status = "cancelled"
            job.completed_at = datetime.utcnow()
    
    await db.commit()
    
    return JobCancelResponse(
        experiment_id=experiment.id,
        status="cancelled",
        message="Experiment cancelled successfully",
    )


@router.delete("/{experiment_id}", status_code=204)
async def delete_experiment(
    experiment_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = result.scalar_one_or_none()
    
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    await db.delete(experiment)
    await db.commit()
    
    return None
