import asyncio
from datetime import datetime, timedelta
from typing import Dict, Callable, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import numpy as np
from app.models.job import TrainingJob
from app.models.metric import Metric
from app.models.experiment import Experiment
from app.utils.simulation import generate_training_metrics


class TrainingService:
    _instance = None
    _running_jobs: Dict[str, asyncio.Task] = {}
    _subscribers: Dict[str, List[Callable]] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def start_training(self, job_id: str, config: dict, db: AsyncSession):
        """Start a training job simulation"""
        if job_id in self._running_jobs:
            return  # Already running

        # Get job from database
        result = await db.execute(select(TrainingJob).where(TrainingJob.id == job_id))
        job = result.scalar_one_or_none()
        
        if not job:
            return

        # Update job status
        job.status = "running"
        job.started_at = datetime.utcnow()
        await db.commit()
        await db.refresh(job)

        # Start background task (create new db session for background task)
        task = asyncio.create_task(self._run_training(job_id, config))
        self._running_jobs[job_id] = task

    async def _run_training(
        self, job_id: str, config: dict
    ):
        """Run training simulation"""
        from app.database import AsyncSessionLocal
        
        try:
            total_epochs = config["hyperparameters"]["num_epochs"]
            steps_per_epoch = 250

            async with AsyncSessionLocal() as db:
                for epoch in range(total_epochs):
                    # Check if job was cancelled
                    result = await db.execute(
                        select(TrainingJob).where(TrainingJob.id == job_id)
                    )
                    job = result.scalar_one_or_none()
                    
                    if not job or job.status == "cancelled":
                        break

                    for step in range(0, steps_per_epoch, 25):
                        # Generate metrics
                        metrics_data = generate_training_metrics(
                            epoch, step, total_epochs
                        )

                        # Save metric to database
                        metric = Metric(
                            job_id=job_id,
                            epoch=epoch,
                            step=step,
                            loss=metrics_data["loss"],
                            accuracy=metrics_data["accuracy"],
                            learning_rate=metrics_data["learning_rate"],
                            throughput=metrics_data["throughput"],
                        )
                        db.add(metric)

                        # Update job progress
                        job.current_epoch = epoch
                        job.progress = ((epoch * steps_per_epoch + step) / (total_epochs * steps_per_epoch)) * 100

                        await db.commit()

                    # Send update to subscribers
                    await self._notify_subscribers(
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

                    # Simulate training time
                    await asyncio.sleep(2)  # 2 seconds per metric update

                # Mark job as completed
                result = await db.execute(
                    select(TrainingJob).where(TrainingJob.id == job_id)
                )
                job = result.scalar_one_or_none()
                
                if job:
                    job.status = "completed"
                    job.completed_at = datetime.utcnow()
                    job.progress = 100.0
                    
                    # Update experiment status
                    exp_result = await db.execute(
                        select(Experiment).where(Experiment.id == job.experiment_id)
                    )
                    experiment = exp_result.scalar_one_or_none()
                    if experiment:
                        experiment.status = "completed"
                        experiment.completed_at = datetime.utcnow()
                    
                    await db.commit()

                    # Send completion notification
                    await self._notify_subscribers(
                        job_id,
                        {
                            "type": "job_complete",
                            "job_id": job_id,
                            "status": "completed",
                            "final_metrics": {
                                "loss": metrics_data["loss"],
                                "accuracy": metrics_data["accuracy"],
                            },
                            "completed_at": datetime.utcnow().isoformat(),
                        },
                    )

        except Exception as e:
            # Mark job as failed
            from app.database import AsyncSessionLocal
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(TrainingJob).where(TrainingJob.id == job_id)
                )
                job = result.scalar_one_or_none()
                
                if job:
                    job.status = "failed"
                    job.error_message = str(e)
                    job.completed_at = datetime.utcnow()
                    
                    exp_result = await db.execute(
                        select(Experiment).where(Experiment.id == job.experiment_id)
                    )
                    experiment = exp_result.scalar_one_or_none()
                    if experiment:
                        experiment.status = "failed"
                        experiment.completed_at = datetime.utcnow()
                    
                    await db.commit()
        finally:
            if job_id in self._running_jobs:
                del self._running_jobs[job_id]

    def subscribe_to_job(self, job_id: str, callback: Callable):
        """Subscribe to metric updates for a job"""
        if job_id not in self._subscribers:
            self._subscribers[job_id] = []
        self._subscribers[job_id].append(callback)

    def unsubscribe_from_job(self, job_id: str):
        """Unsubscribe from job updates"""
        if job_id in self._subscribers:
            del self._subscribers[job_id]

    async def _notify_subscribers(self, job_id: str, update: dict):
        """Notify all subscribers of a job update"""
        if job_id in self._subscribers:
            for callback in self._subscribers[job_id]:
                try:
                    await callback(update)
                except Exception as e:
                    print(f"Error notifying subscriber: {e}")
