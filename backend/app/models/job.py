from sqlalchemy import Column, String, Integer, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String, ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending, running, completed, failed, cancelled
    progress = Column(Numeric(5, 2), default=0.0)
    current_epoch = Column(Integer, default=0)
    total_epochs = Column(Integer, nullable=False)
    logs = Column(Text)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    avg_epoch_time = Column(Numeric(10, 2))
    estimated_completion = Column(DateTime(timezone=True))

    # Relationships
    experiment = relationship("Experiment", back_populates="training_jobs")
    metrics = relationship("Metric", back_populates="job", cascade="all, delete-orphan")
