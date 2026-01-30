from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.supabase_client import get_supabase
from app.schemas.api import ComparisonRequest, ComparisonResponse, ComparisonData

router = APIRouter()


@router.post("/experiments/compare", response_model=ComparisonResponse)
def compare_experiments(
    request: ComparisonRequest,
    supabase: Client = Depends(get_supabase),
):
    comparison_data = []
    for exp_id in request.experiment_ids:
        exp_res = supabase.table("experiments").select("*").eq("id", exp_id).maybe_single().execute()
        if not exp_res.data:
            raise HTTPException(status_code=404, detail=f"Experiment {exp_id} not found")
        experiment = exp_res.data

        job_res = (
            supabase.table("training_jobs")
            .select("*")
            .eq("experiment_id", exp_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        jobs = job_res.data or []
        if not jobs:
            continue
        job = jobs[0]

        metrics_res = (
            supabase.table("metrics")
            .select("*")
            .eq("job_id", job["id"])
            .order("epoch")
            .order("step")
            .execute()
        )
        metrics = metrics_res.data or []

        metrics_dict = {}
        for metric_name in request.metrics:
            values = []
            data_points = []
            for m in metrics:
                value = m.get(metric_name)
                if value is not None:
                    values.append(float(value))
                    data_points.append({"epoch": m["epoch"], "value": float(value)})
            if values:
                metrics_dict[metric_name] = {
                    "min": min(values),
                    "max": max(values),
                    "final": values[-1],
                    "data_points": data_points,
                }

        config = experiment.get("config") or {}
        hp = config.get("hyperparameters") or {}
        comparison_data.append(
            ComparisonData(
                experiment_id=exp_id,
                name=experiment["name"],
                config={
                    "batch_size": hp.get("batch_size"),
                    "learning_rate": hp.get("learning_rate"),
                },
                metrics=metrics_dict,
            )
        )
    return ComparisonResponse(comparison=comparison_data)
