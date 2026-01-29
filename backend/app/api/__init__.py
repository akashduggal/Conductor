from fastapi import APIRouter
from . import datasets, experiments, jobs, metrics, stats, comparison

api_router = APIRouter()

api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(experiments.router, prefix="/experiments", tags=["experiments"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(metrics.router, prefix="", tags=["metrics"])
api_router.include_router(stats.router, prefix="", tags=["stats"])
api_router.include_router(comparison.router, prefix="", tags=["comparison"])
