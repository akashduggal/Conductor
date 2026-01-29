from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class MetricResponse(BaseModel):
    id: Optional[str] = None
    job_id: str
    epoch: int
    step: int
    loss: float
    accuracy: Optional[float] = None
    learning_rate: Optional[float] = None
    throughput: Optional[float] = None
    gpu_utilization: Optional[float] = None
    memory_used_gb: Optional[float] = None
    custom_metrics: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class MetricSummary(BaseModel):
    total_points: int
    returned_points: int
    best_loss: float
    best_accuracy: float
    current_loss: float
    current_accuracy: float


class MetricsResponse(BaseModel):
    job_id: str
    metrics: List[MetricResponse]
    summary: MetricSummary


class MetricUpdate(BaseModel):
    type: str  # metric_update or job_complete
    job_id: str
    epoch: int
    step: int
    metrics: Dict[str, float]
    timestamp: datetime
    status: Optional[str] = None
    final_metrics: Optional[Dict[str, float]] = None
    completed_at: Optional[datetime] = None
