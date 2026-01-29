from pydantic import BaseModel
from typing import Dict, List


class StatsOverview(BaseModel):
    experiments: Dict[str, int]
    datasets: Dict
    jobs: Dict[str, int]


class ComparisonRequest(BaseModel):
    experiment_ids: List[str]
    metrics: List[str]


class ComparisonData(BaseModel):
    experiment_id: str
    name: str
    config: Dict[str, float]
    metrics: Dict[str, Dict]


class ComparisonResponse(BaseModel):
    comparison: List[ComparisonData]
