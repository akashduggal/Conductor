from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class ExperimentConfig(BaseModel):
    model_type: str
    hyperparameters: Dict[str, Any]
    architecture: Optional[Dict[str, Any]] = None
    data_config: Optional[Dict[str, Any]] = None


class ExperimentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    dataset_id: Optional[str] = None
    config: ExperimentConfig
    tags: Optional[List[str]] = None


class ExperimentCreate(ExperimentBase):
    pass


class CurrentJob(BaseModel):
    id: str
    progress: float
    current_epoch: int
    latest_metrics: Optional[Dict[str, float]] = None


class ExperimentResponse(ExperimentBase):
    id: str
    status: str
    created_by: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    dataset_name: Optional[str] = None
    current_job: Optional[CurrentJob] = None
    training_jobs: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True


class ExperimentListResponse(BaseModel):
    data: List[ExperimentResponse]
    pagination: Dict[str, int]


class JobStartResponse(BaseModel):
    experiment_id: str
    job_id: str
    status: str
    message: str


class JobCancelResponse(BaseModel):
    experiment_id: str
    status: str
    message: str
