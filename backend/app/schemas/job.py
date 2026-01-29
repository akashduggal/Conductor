from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TrainingJobResponse(BaseModel):
    id: str
    experiment_id: str
    status: str
    progress: float
    current_epoch: int
    total_epochs: int
    logs: Optional[str] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    avg_epoch_time: Optional[float] = None
    estimated_completion: Optional[datetime] = None

    class Config:
        from_attributes = True
