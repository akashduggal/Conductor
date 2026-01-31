from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.supabase_client import get_supabase
from app.schemas.job import TrainingJobResponse

router = APIRouter()


@router.get("/{job_id}", response_model=TrainingJobResponse)
def get_job(
    job_id: str,
    supabase: Client = Depends(get_supabase),
):
    res = supabase.table("training_jobs").select("*").eq("id", job_id).maybe_single().execute()
    if not res or not getattr(res, "data", None):
        raise HTTPException(status_code=404, detail="Job not found")
    j = res.data
    return TrainingJobResponse(
        id=j["id"],
        experiment_id=j["experiment_id"],
        status=j["status"],
        progress=float(j.get("progress") or 0),
        current_epoch=int(j.get("current_epoch") or 0),
        total_epochs=int(j["total_epochs"]),
        logs=j.get("logs"),
        error_message=j.get("error_message"),
        started_at=j.get("started_at"),
        completed_at=j.get("completed_at"),
        created_at=j.get("created_at"),
        avg_epoch_time=float(j["avg_epoch_time"]) if j.get("avg_epoch_time") is not None else None,
        estimated_completion=j.get("estimated_completion"),
    )
