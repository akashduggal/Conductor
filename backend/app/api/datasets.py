from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate, DatasetResponse, DatasetListResponse

router = APIRouter()


@router.get("", response_model=DatasetListResponse)
async def get_datasets(
    modality: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query("created_at"),
    order: Optional[str] = Query("desc"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Dataset)
    
    if modality:
        query = query.where(Dataset.modality == modality)
    
    # Get total count
    count_query = select(func.count()).select_from(Dataset)
    if modality:
        count_query = count_query.where(Dataset.modality == modality)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply sorting
    if sort_by == "name":
        order_by_col = Dataset.name
    elif sort_by == "size_bytes":
        order_by_col = Dataset.size_bytes
    else:
        order_by_col = Dataset.created_at
    
    if order == "asc":
        query = query.order_by(order_by_col.asc())
    else:
        query = query.order_by(order_by_col.desc())
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    datasets = result.scalars().all()
    
    # Get stats for each dataset
    dataset_responses = []
    for dataset in datasets:
        dataset_dict = {
            "id": dataset.id,
            "name": dataset.name,
            "modality": dataset.modality,
            "size_bytes": dataset.size_bytes,
            "file_count": dataset.file_count,
            "description": dataset.description,
            "storage_path": dataset.storage_path,
            "created_at": dataset.created_at,
            "updated_at": dataset.updated_at,
            "metadata": dataset.meta_data or {},
            "stats": {},  # Could be enhanced with experiment counts
        }
        dataset_responses.append(DatasetResponse(**dataset_dict))
    
    return DatasetListResponse(
        data=dataset_responses,
        pagination={
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        },
    )


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return DatasetResponse(
        id=dataset.id,
        name=dataset.name,
        modality=dataset.modality,
        size_bytes=dataset.size_bytes,
        file_count=dataset.file_count,
        description=dataset.description,
        storage_path=dataset.storage_path,
        created_at=dataset.created_at,
        updated_at=dataset.updated_at,
        metadata=dataset.meta_data or {},
        stats={},
    )


@router.post("", response_model=DatasetResponse, status_code=201)
async def create_dataset(
    dataset: DatasetCreate,
    db: AsyncSession = Depends(get_db),
):
    db_dataset = Dataset(**dataset.model_dump())
    db.add(db_dataset)
    await db.commit()
    await db.refresh(db_dataset)
    
    return DatasetResponse(
        id=db_dataset.id,
        name=db_dataset.name,
        modality=db_dataset.modality,
        size_bytes=db_dataset.size_bytes,
        file_count=db_dataset.file_count,
        description=db_dataset.description,
        storage_path=db_dataset.storage_path,
        created_at=db_dataset.created_at,
        updated_at=db_dataset.updated_at,
        metadata=db_dataset.meta_data or {},
        stats={},
    )


@router.delete("/{dataset_id}", status_code=204)
async def delete_dataset(
    dataset_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    await db.delete(dataset)
    await db.commit()
    
    return None
