import asyncio
import threading
import time
import uuid
from datetime import datetime
from typing import Dict, Callable, List
from supabase import Client
from app.supabase_client import get_supabase
from app.utils.simulation import generate_training_metrics


class TrainingService:
    _instance = None
    _running_jobs: Dict[str, threading.Thread] = {}
    _subscribers: Dict[str, List[Callable]] = {}
    _loop = None  # Main event loop for scheduling async notifications from background thread

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def start_training(self, job_id: str, config: dict, supabase: Client):
        """Start a training job simulation (runs in background thread using Supabase)."""
        if job_id in self._running_jobs:
            return  # Already running

        res = supabase.table("training_jobs").select("*").eq("id", job_id).maybe_single().execute()
        if not res.data:
            return

        now = datetime.utcnow().isoformat()
        supabase.table("training_jobs").update({
            "status": "running",
            "started_at": now,
        }).eq("id", job_id).execute()

        thread = threading.Thread(target=self._run_training_sync, args=(job_id, config))
        thread.daemon = True
        thread.start()
        self._running_jobs[job_id] = thread

    def _run_training_sync(self, job_id: str, config: dict):
        """Run training simulation in background thread using Supabase."""
        supabase = get_supabase()
        metrics_data = {"loss": 0.0, "accuracy": 0.0}
        try:
            hp = config.get("hyperparameters") or {}
            total_epochs = hp.get("num_epochs", 10)
            steps_per_epoch = 250

            for epoch in range(total_epochs):
                job_res = supabase.table("training_jobs").select("*").eq("id", job_id).maybe_single().execute()
                if not job_res.data or job_res.data.get("status") == "cancelled":
                    break
                job = job_res.data

                for step in range(0, steps_per_epoch, 25):
                    metrics_data = generate_training_metrics(epoch, step, total_epochs)
                    supabase.table("metrics").insert({
                        "id": str(uuid.uuid4()),
                        "job_id": job_id,
                        "epoch": epoch,
                        "step": step,
                        "loss": metrics_data["loss"],
                        "accuracy": metrics_data["accuracy"],
                        "learning_rate": metrics_data["learning_rate"],
                        "throughput": metrics_data["throughput"],
                    }).execute()

                    progress = ((epoch * steps_per_epoch + step) / (total_epochs * steps_per_epoch)) * 100
                    supabase.table("training_jobs").update({
                        "current_epoch": epoch,
                        "progress": progress,
                    }).eq("id", job_id).execute()

                self._notify_sync(
                    job_id,
                    {
                        "type": "metric_update",
                        "job_id": job_id,
                        "epoch": epoch,
                        "step": step,
                        "metrics": {
                            "loss": metrics_data["loss"],
                            "accuracy": metrics_data["accuracy"],
                            "learning_rate": metrics_data["learning_rate"],
                            "throughput": metrics_data["throughput"],
                        },
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                )
                time.sleep(2)

            now = datetime.utcnow().isoformat()
            supabase.table("training_jobs").update({
                "status": "completed",
                "completed_at": now,
                "progress": 100.0,
            }).eq("id", job_id).execute()

            job_res = supabase.table("training_jobs").select("experiment_id").eq("id", job_id).maybe_single().execute()
            if job_res.data:
                exp_id = job_res.data["experiment_id"]
                supabase.table("experiments").update({
                    "status": "completed",
                    "completed_at": now,
                }).eq("id", exp_id).execute()

            self._notify_sync(
                job_id,
                {
                    "type": "job_complete",
                    "job_id": job_id,
                    "status": "completed",
                    "final_metrics": {
                        "loss": metrics_data["loss"],
                        "accuracy": metrics_data["accuracy"],
                    },
                    "completed_at": now,
                },
            )
        except Exception as e:
            now = datetime.utcnow().isoformat()
            supabase.table("training_jobs").update({
                "status": "failed",
                "error_message": str(e),
                "completed_at": now,
            }).eq("id", job_id).execute()
            job_res = supabase.table("training_jobs").select("experiment_id").eq("id", job_id).maybe_single().execute()
            if job_res.data:
                exp_id = job_res.data["experiment_id"]
                supabase.table("experiments").update({
                    "status": "failed",
                    "completed_at": now,
                }).eq("id", exp_id).execute()
        finally:
            if job_id in self._running_jobs:
                del self._running_jobs[job_id]

    def _notify_sync(self, job_id: str, update: dict):
        if not self._subscribers.get(job_id) or not self._loop:
            return
        for callback in self._subscribers[job_id]:
            try:
                asyncio.run_coroutine_threadsafe(callback(update), self._loop)
            except Exception as e:
                print(f"Error notifying subscriber: {e}")

    def subscribe_to_job(self, job_id: str, callback: Callable):
        if job_id not in self._subscribers:
            self._subscribers[job_id] = []
        self._subscribers[job_id].append(callback)

    def unsubscribe_from_job(self, job_id: str):
        if job_id in self._subscribers:
            del self._subscribers[job_id]

    async def _notify_subscribers(self, job_id: str, update: dict):
        if job_id in self._subscribers:
            for callback in self._subscribers[job_id]:
                try:
                    await callback(update)
                except Exception as e:
                    print(f"Error notifying subscriber: {e}")
