import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from typing import Optional, List
from app.supabase_client import get_supabase
from app.schemas.dataset import DatasetCreate, DatasetResponse, DatasetListResponse

router = APIRouter()


def _dataset_row_to_response(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "modality": row["modality"],
        "size_bytes": row["size_bytes"],
        "file_count": row["file_count"],
        "description": row.get("description"),
        "storage_path": row.get("storage_path"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
        "metadata": row.get("metadata") or {},
        "stats": {},
    }


@router.get("", response_model=DatasetListResponse)
def get_datasets(
    modality: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query("created_at"),
    order: Optional[str] = Query("desc"),
    supabase: Client = Depends(get_supabase),
):
    q = supabase.table("datasets").select("*", count="exact")
    if modality:
        q = q.eq("modality", modality)
    if sort_by == "name":
        q = q.order("name", desc=(order == "desc"))
    elif sort_by == "size_bytes":
        q = q.order("size_bytes", desc=(order == "desc"))
    else:
        q = q.order("created_at", desc=(order == "desc"))
    offset = (page - 1) * page_size
    q = q.range(offset, offset + page_size - 1)
    res = q.execute()
    rows = res.data or []
    total = getattr(res, "count", None) if hasattr(res, "count") else len(rows)
    if total is None:
        count_res = supabase.table("datasets").select("id", count="exact").limit(1).execute()
        total = getattr(count_res, "count", len(rows)) or len(rows)
    if modality and total == len(rows):
        total = len(rows)

    data = [_dataset_row_to_response(r) for r in rows]
    return DatasetListResponse(
        data=[DatasetResponse(**d) for d in data],
        pagination={
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total else 0,
        },
    )


@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: str,
    supabase: Client = Depends(get_supabase),
):
    res = supabase.table("datasets").select("*").eq("id", dataset_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return DatasetResponse(**_dataset_row_to_response(res.data))


@router.post("", response_model=DatasetResponse, status_code=201)
def create_dataset(
    dataset: DatasetCreate,
    supabase: Client = Depends(get_supabase),
):
    payload = dataset.model_dump()
    payload["id"] = str(uuid.uuid4())
    payload["metadata"] = payload.get("metadata") or {}
    res = supabase.table("datasets").insert(payload).select().execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Insert failed")
    row = res.data[0]
    return DatasetResponse(**_dataset_row_to_response(row))


@router.delete("/{dataset_id}", status_code=204)
def delete_dataset(
    dataset_id: str,
    supabase: Client = Depends(get_supabase),
):
    res = supabase.table("datasets").delete().eq("id", dataset_id).execute()
    return None
