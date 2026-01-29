from sqlalchemy import Column, String, Integer, Numeric, DateTime, JSON, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("training_jobs.id", ondelete="CASCADE"), nullable=False)
    epoch = Column(Integer, nullable=False)
    step = Column(Integer, nullable=False)
    
    # Core metrics
    loss = Column(Numeric(15, 8), nullable=False)
    accuracy = Column(Numeric(8, 6))
    learning_rate = Column(Numeric(12, 10))
    
    # Performance metrics
    throughput = Column(Numeric(10, 2))
    gpu_utilization = Column(Numeric(5, 2))
    memory_used_gb = Column(Numeric(10, 2))
    
    # Custom metrics
    custom_metrics = Column(JSON, default=dict)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job = relationship("TrainingJob", back_populates="metrics")

    # Indexes
    __table_args__ = (
        Index("idx_metrics_job_id", "job_id"),
        Index("idx_metrics_epoch", "epoch"),
        Index("idx_metrics_timestamp", "timestamp"),
        Index("idx_metrics_job_epoch_step", "job_id", "epoch", "step"),
    )
