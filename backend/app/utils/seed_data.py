"""
Database seeder script to populate the database with demo data.
Run with: python -m app.utils.seed_data
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from app.database import AsyncSessionLocal, init_db
from app.models.dataset import Dataset
from app.models.experiment import Experiment
from app.models.job import TrainingJob
from app.models.metric import Metric
from app.utils.simulation import generate_training_metrics


async def seed_datasets(db):
    """Seed datasets table"""
    datasets_data = [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "ImageNet Subset 2024",
            "modality": "image",
            "size_bytes": 15728640000,
            "file_count": 50000,
            "description": "Curated ImageNet subset for quick experimentation",
            "storage_path": "/data/images/imagenet-subset",
            "metadata": {
                "resolution": "224x224",
                "format": "jpeg",
                "classes": 1000,
                "train_samples": 40000,
                "val_samples": 5000,
                "test_samples": 5000,
            },
        },
        {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "name": "Audio Samples 2026",
            "modality": "audio",
            "size_bytes": 5368709120,
            "file_count": 10000,
            "description": "Speech recognition training data",
            "storage_path": "/data/audio/speech-2026",
            "metadata": {
                "sample_rate": 16000,
                "duration_seconds": 36000,
                "format": "wav",
            },
        },
        {
            "id": "770e8400-e29b-41d4-a716-446655440002",
            "name": "Multimodal Corpus v2",
            "modality": "multimodal",
            "size_bytes": 32212254720,
            "file_count": 25000,
            "description": "Combined text, image, and audio dataset",
            "metadata": {
                "text_samples": 10000,
                "image_samples": 10000,
                "audio_samples": 5000,
            },
        },
        {
            "id": "880e8400-e29b-41d4-a716-446655440003",
            "name": "Video Dataset 2025",
            "modality": "video",
            "size_bytes": 107374182400,
            "file_count": 5000,
            "description": "Video classification dataset",
            "metadata": {
                "resolution": "1920x1080",
                "fps": 30,
                "duration_seconds": 180000,
            },
        },
        {
            "id": "990e8400-e29b-41d4-a716-446655440004",
            "name": "Text Corpus Large",
            "modality": "text",
            "size_bytes": 2147483648,
            "file_count": 100000,
            "description": "Large text corpus for language modeling",
            "metadata": {
                "tokens": 50000000,
                "languages": ["en", "es", "fr"],
            },
        },
    ]

    for data in datasets_data:
        result = await db.execute(select(Dataset).where(Dataset.id == data["id"]))
        existing = result.scalar_one_or_none()
        
        if not existing:
            dataset = Dataset(**data)
            db.add(dataset)
            print(f"✓ Created dataset: {data['name']}")
        else:
            print(f"⊘ Dataset already exists: {data['name']}")

    await db.commit()


async def seed_experiments(db):
    """Seed experiments table"""
    experiments_data = [
        {
            "id": "exp-001-2026-01-28",
            "name": "Multimodal Transformer v3",
            "description": "Improved architecture with attention mechanisms",
            "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
            "status": "running",
            "config": {
                "model_type": "multimodal_transformer",
                "hyperparameters": {
                    "batch_size": 32,
                    "learning_rate": 0.001,
                    "optimizer": "adamw",
                    "num_epochs": 100,
                    "weight_decay": 0.01,
                },
                "architecture": {
                    "hidden_size": 768,
                    "num_layers": 12,
                    "num_heads": 12,
                },
                "data_config": {
                    "train_split": 0.8,
                    "val_split": 0.1,
                    "test_split": 0.1,
                },
            },
            "created_at": datetime.utcnow() - timedelta(days=2),
            "started_at": datetime.utcnow() - timedelta(days=2, hours=1),
            "tags": ["vision", "transformer", "production"],
        },
        {
            "id": "exp-002-2026-01-28",
            "name": "Audio Classification Model",
            "description": "Speech recognition experiment",
            "dataset_id": "660e8400-e29b-41d4-a716-446655440001",
            "status": "completed",
            "config": {
                "model_type": "audio_classifier",
                "hyperparameters": {
                    "batch_size": 64,
                    "learning_rate": 0.0005,
                    "optimizer": "adam",
                    "num_epochs": 50,
                    "weight_decay": 0.0001,
                },
            },
            "created_at": datetime.utcnow() - timedelta(days=5),
            "started_at": datetime.utcnow() - timedelta(days=5, hours=1),
            "completed_at": datetime.utcnow() - timedelta(days=3),
            "tags": ["audio", "speech"],
        },
        {
            "id": "exp-003-2026-01-28",
            "name": "Vision Transformer Baseline",
            "description": "Baseline ViT model for comparison",
            "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
            "status": "completed",
            "config": {
                "model_type": "vision_transformer",
                "hyperparameters": {
                    "batch_size": 16,
                    "learning_rate": 0.002,
                    "optimizer": "adamw",
                    "num_epochs": 100,
                    "weight_decay": 0.01,
                },
            },
            "created_at": datetime.utcnow() - timedelta(days=7),
            "started_at": datetime.utcnow() - timedelta(days=7, hours=1),
            "completed_at": datetime.utcnow() - timedelta(days=4),
            "tags": ["vision", "baseline"],
        },
        {
            "id": "exp-004-2026-01-28",
            "name": "Large Language Model Fine-tune",
            "description": "Fine-tuning GPT-style model on text corpus",
            "dataset_id": "990e8400-e29b-41d4-a716-446655440004",
            "status": "queued",
            "config": {
                "model_type": "language_model",
                "hyperparameters": {
                    "batch_size": 8,
                    "learning_rate": 0.0001,
                    "optimizer": "adamw",
                    "num_epochs": 150,
                    "weight_decay": 0.01,
                },
            },
            "created_at": datetime.utcnow() - timedelta(hours=2),
            "tags": ["nlp", "llm"],
        },
        {
            "id": "exp-005-2026-01-28",
            "name": "Multimodal Fusion Experiment",
            "description": "Testing different fusion strategies",
            "dataset_id": "770e8400-e29b-41d4-a716-446655440002",
            "status": "created",
            "config": {
                "model_type": "multimodal_fusion",
                "hyperparameters": {
                    "batch_size": 24,
                    "learning_rate": 0.0015,
                    "optimizer": "adamw",
                    "num_epochs": 80,
                    "weight_decay": 0.005,
                },
            },
            "created_at": datetime.utcnow() - timedelta(hours=1),
            "tags": ["multimodal", "fusion", "experimental"],
        },
        {
            "id": "exp-006-2026-01-28",
            "name": "Video Action Recognition",
            "description": "Action recognition on video dataset",
            "dataset_id": "880e8400-e29b-41d4-a716-446655440003",
            "status": "failed",
            "config": {
                "model_type": "video_classifier",
                "hyperparameters": {
                    "batch_size": 4,
                    "learning_rate": 0.0003,
                    "optimizer": "sgd",
                    "num_epochs": 60,
                    "weight_decay": 0.001,
                },
            },
            "created_at": datetime.utcnow() - timedelta(days=3),
            "started_at": datetime.utcnow() - timedelta(days=3, hours=1),
            "completed_at": datetime.utcnow() - timedelta(days=2),
            "tags": ["video", "action"],
        },
    ]

    for data in experiments_data:
        result = await db.execute(select(Experiment).where(Experiment.id == data["id"]))
        existing = result.scalar_one_or_none()
        
        if not existing:
            experiment = Experiment(**data)
            db.add(experiment)
            print(f"✓ Created experiment: {data['name']}")
        else:
            print(f"⊘ Experiment already exists: {data['name']}")

    await db.commit()


async def seed_jobs_and_metrics(db):
    """Seed training jobs and metrics"""
    # Get experiments
    result = await db.execute(select(Experiment))
    experiments = result.scalars().all()

    for exp in experiments:
        if exp.status in ["running", "completed", "failed"]:
            # Create job
            job_id = f"job-{exp.id}"
            result = await db.execute(select(TrainingJob).where(TrainingJob.id == job_id))
            existing_job = result.scalar_one_or_none()
            
            if existing_job:
                print(f"⊘ Job already exists for: {exp.name}")
                continue

            total_epochs = exp.config["hyperparameters"]["num_epochs"]
            steps_per_epoch = 250
            
            # Determine progress based on status
            if exp.status == "completed":
                current_epoch = total_epochs - 1
                progress = 100.0
            elif exp.status == "running":
                current_epoch = 42  # Simulate mid-training
                progress = (current_epoch / total_epochs) * 100
            else:  # failed
                current_epoch = 15
                progress = (current_epoch / total_epochs) * 100

            job = TrainingJob(
                id=job_id,
                experiment_id=exp.id,
                status=exp.status,
                progress=progress,
                current_epoch=current_epoch,
                total_epochs=total_epochs,
                started_at=exp.started_at,
                completed_at=exp.completed_at if exp.status != "running" else None,
                error_message="Out of memory error" if exp.status == "failed" else None,
            )
            db.add(job)
            await db.flush()

            # Generate metrics
            metrics_count = 0
            for epoch in range(current_epoch + 1):
                for step in range(0, steps_per_epoch, 25):
                    metrics_data = generate_training_metrics(epoch, step, total_epochs)
                    
                    metric = Metric(
                        job_id=job_id,
                        epoch=epoch,
                        step=step,
                        loss=metrics_data["loss"],
                        accuracy=metrics_data["accuracy"],
                        learning_rate=metrics_data["learning_rate"],
                        throughput=metrics_data["throughput"],
                        timestamp=exp.started_at + timedelta(
                            seconds=(epoch * steps_per_epoch + step) * 2
                        ) if exp.started_at else datetime.utcnow(),
                    )
                    db.add(metric)
                    metrics_count += 1

            print(f"✓ Created job with {metrics_count} metrics for: {exp.name}")

    await db.commit()


async def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    print("=" * 50)
    
    # Initialize database
    await init_db()
    
    async with AsyncSessionLocal() as db:
        print("\n📦 Seeding datasets...")
        await seed_datasets(db)
        
        print("\n🧪 Seeding experiments...")
        await seed_experiments(db)
        
        print("\n⚙️  Seeding training jobs and metrics...")
        await seed_jobs_and_metrics(db)
    
    print("\n" + "=" * 50)
    print("✅ Database seeding completed!")
    print("\nYou can now start the backend and frontend to see the demo data.")


if __name__ == "__main__":
    asyncio.run(main())
