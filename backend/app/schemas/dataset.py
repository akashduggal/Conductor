from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class DatasetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    modality: str = Field(..., pattern="^(text|image|audio|video|multimodal)$")
    size_bytes: int = Field(..., gt=0)
    file_count: int = Field(..., gt=0)
    description: Optional[str] = None
    storage_path: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class DatasetCreate(DatasetBase):
    pass


class DatasetResponse(DatasetBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    stats: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class DatasetListResponse(BaseModel):
    data: List[DatasetResponse]
    pagination: Dict[str, int]
