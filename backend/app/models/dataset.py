from sqlalchemy import Column, String, Integer, BigInteger, Text, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    modality = Column(String(50), nullable=False)  # text, image, audio, video, multimodal
    size_bytes = Column(BigInteger, nullable=False)
    file_count = Column(Integer, nullable=False)
    description = Column(Text)
    storage_path = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    meta_data = Column("metadata", JSON, default=dict)
