"""
Database seeder script to populate Supabase with demo data.
Run with: python -m app.utils.seed_data
Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local / .env
Create tables first: run supabase/schema.sql in Supabase SQL Editor.
"""
import uuid
from datetime import datetime, timedelta
from app.supabase_client import get_supabase
from app.utils.simulation import generate_training_metrics


def seed_datasets(supabase):
    """Seed datasets table (column is 'metadata' in Supabase)."""
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
        res = supabase.table("datasets").select("id").eq("id", data["id"]).maybe_single().execute()
        if not res or not getattr(res, "data", None):
            supabase.table("datasets").insert(data).execute()
            print(f"✓ Created dataset: {data['name']}")
        else:
            print(f"⊘ Dataset already exists: {data['name']}")


def seed_experiments(supabase):
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
                "architecture": {"hidden_size": 768, "num_layers": 12, "num_heads": 12},
                "data_config": {"train_split": 0.8, "val_split": 0.1, "test_split": 0.1},
            },
            "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
            "started_at": (datetime.utcnow() - timedelta(days=2, hours=1)).isoformat(),
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
            "created_at": (datetime.utcnow() - timedelta(days=5)).isoformat(),
            "started_at": (datetime.utcnow() - timedelta(days=5, hours=1)).isoformat(),
            "completed_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
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
            "created_at": (datetime.utcnow() - timedelta(days=7)).isoformat(),
            "started_at": (datetime.utcnow() - timedelta(days=7, hours=1)).isoformat(),
            "completed_at": (datetime.utcnow() - timedelta(days=4)).isoformat(),
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
            "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
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
            "created_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
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
            "created_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
            "started_at": (datetime.utcnow() - timedelta(days=3, hours=1)).isoformat(),
            "completed_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
            "tags": ["video", "action"],
        },
    ]

    for data in experiments_data:
        res = supabase.table("experiments").select("id").eq("id", data["id"]).maybe_single().execute()
        if not res or not getattr(res, "data", None):
            supabase.table("experiments").insert(data).execute()
            print(f"✓ Created experiment: {data['name']}")
        else:
            print(f"⊘ Experiment already exists: {data['name']}")


def seed_jobs_and_metrics(supabase):
    """Seed training jobs and metrics"""
    res = supabase.table("experiments").select("*").execute()
    experiments = (res.data if res else None) or []

    for exp in experiments:
        if exp["status"] not in ["running", "completed", "failed"]:
            continue
        job_id = f"job-{exp['id']}"
        res = supabase.table("training_jobs").select("id").eq("id", job_id).maybe_single().execute()
        if res and getattr(res, "data", None):
            print(f"⊘ Job already exists for: {exp['name']}")
            continue

        config = exp.get("config") or {}
        hp = config.get("hyperparameters") or {}
        total_epochs = hp.get("num_epochs", 10)
        steps_per_epoch = 250

        if exp["status"] == "completed":
            current_epoch = total_epochs - 1
            progress = 100.0
        elif exp["status"] == "running":
            current_epoch = 42
            progress = (current_epoch / total_epochs) * 100
        else:
            current_epoch = 15
            progress = (current_epoch / total_epochs) * 100

        job_payload = {
            "id": job_id,
            "experiment_id": exp["id"],
            "status": exp["status"],
            "progress": progress,
            "current_epoch": current_epoch,
            "total_epochs": total_epochs,
            "started_at": exp.get("started_at"),
            "completed_at": exp.get("completed_at") if exp["status"] != "running" else None,
            "error_message": "Out of memory error" if exp["status"] == "failed" else None,
        }
        supabase.table("training_jobs").insert(job_payload).execute()

        metrics_count = 0
        started_at = exp.get("started_at") or datetime.utcnow().isoformat()
        for epoch in range(current_epoch + 1):
            for step in range(0, steps_per_epoch, 25):
                metrics_data = generate_training_metrics(epoch, step, total_epochs)
                ts = datetime.utcnow() + timedelta(seconds=(epoch * steps_per_epoch + step) * 2)
                supabase.table("metrics").insert({
                    "id": str(uuid.uuid4()),
                    "job_id": job_id,
                    "epoch": epoch,
                    "step": step,
                    "loss": metrics_data["loss"],
                    "accuracy": metrics_data["accuracy"],
                    "learning_rate": metrics_data["learning_rate"],
                    "throughput": metrics_data["throughput"],
                    "timestamp": ts.isoformat(),
                }).execute()
                metrics_count += 1

        print(f"✓ Created job with {metrics_count} metrics for: {exp['name']}")


def main():
    """Main seeding function"""
    print("🌱 Starting Supabase seeding...")
    print("=" * 50)
    supabase = get_supabase()
    print("\n📦 Seeding datasets...")
    seed_datasets(supabase)
    print("\n🧪 Seeding experiments...")
    seed_experiments(supabase)
    print("\n⚙️  Seeding training jobs and metrics...")
    seed_jobs_and_metrics(supabase)
    print("\n" + "=" * 50)
    print("✅ Database seeding completed!")
    print("\nYou can now start the backend and frontend to see the demo data.")


if __name__ == "__main__":
    main()
