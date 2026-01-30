from fastapi import APIRouter, Depends
from app.supabase_client import get_supabase
from supabase import Client
from app.schemas.api import StatsOverview

router = APIRouter()


@router.get("/stats/overview", response_model=StatsOverview)
def get_stats_overview(supabase: Client = Depends(get_supabase)):
    # Experiments: fetch all and aggregate
    exp_res = supabase.table("experiments").select("*").execute()
    experiments = exp_res.data or []
    exp_total = len(experiments)
    exp_running = sum(1 for e in experiments if e.get("status") == "running")
    exp_completed = sum(1 for e in experiments if e.get("status") == "completed")
    exp_failed = sum(1 for e in experiments if e.get("status") == "failed")
    exp_cancelled = sum(1 for e in experiments if e.get("status") == "cancelled")

    # Datasets
    ds_res = supabase.table("datasets").select("*").execute()
    datasets = ds_res.data or []
    ds_total = len(datasets)
    total_size_bytes = sum((d.get("size_bytes") or 0) for d in datasets)
    modality_counts = {}
    for d in datasets:
        m = d.get("modality") or "unknown"
        modality_counts[m] = modality_counts.get(m, 0) + 1

    # Jobs
    jobs_res = supabase.table("training_jobs").select("status").execute()
    jobs = jobs_res.data or []
    job_active = sum(1 for j in jobs if j.get("status") == "running")
    job_queued = sum(1 for j in jobs if j.get("status") == "pending")

    total_size_gb = total_size_bytes / (1024**3)

    return StatsOverview(
        experiments={
            "total": exp_total,
            "running": exp_running,
            "completed": exp_completed,
            "failed": exp_failed,
            "cancelled": exp_cancelled,
        },
        datasets={
            "total": ds_total,
            "by_modality": {
                "text": modality_counts.get("text", 0),
                "image": modality_counts.get("image", 0),
                "audio": modality_counts.get("audio", 0),
                "video": modality_counts.get("video", 0),
                "multimodal": modality_counts.get("multimodal", 0),
            },
            "total_size_gb": round(total_size_gb, 2),
        },
        jobs={
            "active": job_active,
            "queued": job_queued,
            "avg_duration_minutes": 245,
        },
    )
