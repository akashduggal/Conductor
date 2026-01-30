import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from typing import Optional, List
from app.supabase_client import get_supabase
from app.schemas.experiment import (
    ExperimentCreate,
    ExperimentResponse,
    ExperimentListResponse,
    JobStartResponse,
    JobCancelResponse,
)
from app.services.training import TrainingService

router = APIRouter()


def _exp_row_to_response(exp: dict, dataset_name: Optional[str] = None, current_job: Optional[dict] = None) -> dict:
    return {
        "id": exp["id"],
        "name": exp["name"],
        "description": exp.get("description"),
        "dataset_id": exp.get("dataset_id"),
        "status": exp["status"],
        "config": exp.get("config") or {},
        "created_by": exp.get("created_by"),
        "created_at": exp.get("created_at"),
        "started_at": exp.get("started_at"),
        "completed_at": exp.get("completed_at"),
        "tags": exp.get("tags") or [],
        "dataset_name": dataset_name,
        "current_job": current_job,
        "training_jobs": None,
    }


@router.get("", response_model=ExperimentListResponse)
def get_experiments(
    status: Optional[str] = Query(None),
    dataset_id: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query("created_at"),
    order: Optional[str] = Query("desc"),
    supabase: Client = Depends(get_supabase),
):
    q = supabase.table("experiments").select("*, datasets(name), training_jobs(*)", count="exact")
    if status:
        q = q.eq("status", status)
    if dataset_id:
        q = q.eq("dataset_id", dataset_id)
    if sort_by == "name":
        q = q.order("name", desc=(order == "desc"))
    else:
        q = q.order("created_at", desc=(order == "desc"))
    offset = (page - 1) * page_size
    q = q.range(offset, offset + page_size - 1)
    res = q.execute()
    rows = res.data or []
    total = getattr(res, "count", None)
    if total is None:
        total = len(rows)

    experiment_responses = []
    for exp in rows:
        dataset_name = None
        if isinstance(exp.get("datasets"), dict):
            dataset_name = exp["datasets"].get("name")
        elif isinstance(exp.get("datasets"), list) and exp["datasets"]:
            dataset_name = exp["datasets"][0].get("name") if isinstance(exp["datasets"][0], dict) else None
        jobs = exp.get("training_jobs") or []
        current_job = None
        if jobs:
            latest = max(jobs, key=lambda j: j.get("created_at") or "")
            if latest.get("status") == "running":
                current_job = {
                    "id": latest["id"],
                    "progress": float(latest.get("progress") or 0),
                    "current_epoch": int(latest.get("current_epoch") or 0),
                    "latest_metrics": {},
                }
        exp_clean = {k: v for k, v in exp.items() if k not in ("datasets", "training_jobs")}
        experiment_responses.append(ExperimentResponse(**_exp_row_to_response(exp_clean, dataset_name, current_job)))

    return ExperimentListResponse(
        data=experiment_responses,
        pagination={
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total else 0,
        },
    )


@router.get("/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(
    experiment_id: str,
    supabase: Client = Depends(get_supabase),
):
    res = (
        supabase.table("experiments")
        .select("*, datasets(name), training_jobs(*)")
        .eq("id", experiment_id)
        .maybe_single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Experiment not found")
    exp = res.data
    dataset_name = None
    if isinstance(exp.get("datasets"), dict):
        dataset_name = exp["datasets"].get("name")
    elif isinstance(exp.get("datasets"), list) and exp["datasets"]:
        dataset_name = exp["datasets"][0].get("name") if isinstance(exp["datasets"][0], dict) else None
    jobs = exp.get("training_jobs") or []
    current_job = None
    if jobs:
        latest = max(jobs, key=lambda j: j.get("created_at") or "")
        if latest.get("status") == "running":
            current_job = {
                "id": latest["id"],
                "progress": float(latest.get("progress") or 0),
                "current_epoch": int(latest.get("current_epoch") or 0),
                "latest_metrics": {},
            }
    exp_clean = {k: v for k, v in exp.items() if k not in ("datasets", "training_jobs")}
    return ExperimentResponse(**_exp_row_to_response(exp_clean, dataset_name, current_job))


@router.post("", response_model=ExperimentResponse, status_code=201)
def create_experiment(
    experiment: ExperimentCreate,
    supabase: Client = Depends(get_supabase),
):
    payload = experiment.model_dump()
    payload["id"] = str(uuid.uuid4())
    payload["status"] = "created"
    payload["config"] = payload.get("config") or {}
    if "tags" in payload and payload["tags"] is None:
        payload["tags"] = []
    res = supabase.table("experiments").insert(payload).select().execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Insert failed")
    row = res.data[0]
    dataset_name = None
    if row.get("dataset_id"):
        ds = supabase.table("datasets").select("name").eq("id", row["dataset_id"]).maybe_single().execute()
        if ds.data:
            dataset_name = ds.data.get("name")
    return ExperimentResponse(**_exp_row_to_response(row, dataset_name, None))


@router.post("/{experiment_id}/start", response_model=JobStartResponse)
def start_experiment(
    experiment_id: str,
    supabase: Client = Depends(get_supabase),
):
    res = supabase.table("experiments").select("*").eq("id", experiment_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Experiment not found")
    experiment = res.data

    if experiment["status"] not in ["created", "queued"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start experiment with status: {experiment['status']}",
        )

    config = experiment.get("config") or {}
    hp = config.get("hyperparameters") or {}
    num_epochs = hp.get("num_epochs", 10)
    job_id = str(uuid.uuid4())

    supabase.table("training_jobs").insert({
        "id": job_id,
        "experiment_id": experiment_id,
        "status": "pending",
        "total_epochs": num_epochs,
        "progress": 0,
        "current_epoch": 0,
    }).execute()

    now = datetime.utcnow().isoformat()
    supabase.table("experiments").update({
        "status": "queued",
        "started_at": now,
    }).eq("id", experiment_id).execute()

    training_service = TrainingService()
    training_service.start_training(job_id, config, supabase)

    return JobStartResponse(
        experiment_id=experiment_id,
        job_id=job_id,
        status="queued",
        message="Training job queued successfully",
    )


@router.post("/{experiment_id}/cancel", response_model=JobCancelResponse)
def cancel_experiment(
    experiment_id: str,
    supabase: Client = Depends(get_supabase),
):
    res = (
        supabase.table("experiments")
        .select("*, training_jobs(*)")
        .eq("id", experiment_id)
        .maybe_single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Experiment not found")
    experiment = res.data

    if experiment["status"] not in ["queued", "running"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel experiment with status: {experiment['status']}",
        )

    now = datetime.utcnow().isoformat()
    supabase.table("experiments").update({
        "status": "cancelled",
        "completed_at": now,
    }).eq("id", experiment_id).execute()

    for job in (experiment.get("training_jobs") or []):
        if job.get("status") == "running":
            supabase.table("training_jobs").update({
                "status": "cancelled",
                "completed_at": now,
            }).eq("id", job["id"]).execute()

    return JobCancelResponse(
        experiment_id=experiment_id,
        status="cancelled",
        message="Experiment cancelled successfully",
    )


@router.delete("/{experiment_id}", status_code=204)
def delete_experiment(
    experiment_id: str,
    supabase: Client = Depends(get_supabase),
):
    res = supabase.table("experiments").select("id").eq("id", experiment_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Experiment not found")
    supabase.table("experiments").delete().eq("id", experiment_id).execute()
    return None
