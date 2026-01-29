# Database Seeding Guide

## Quick Start

The database will **automatically seed** with demo data on first startup if it's empty. This is perfect for demos!

## Manual Seeding

If you need to manually seed or reseed the database:

### Option 1: Using Python Module

```bash
cd backend
python -m app.utils.seed_data
```

### Option 2: Using Script

```bash
cd backend
./scripts/seed.sh
```

### Option 3: Using pnpm (if configured)

```bash
cd backend
pnpm seed
```

## What Gets Seeded

The seeder creates:

### 📦 Datasets (5 items)
- ImageNet Subset 2024 (image)
- Audio Samples 2026 (audio)
- Multimodal Corpus v2 (multimodal)
- Video Dataset 2025 (video)
- Text Corpus Large (text)

### 🧪 Experiments (6 items)
- **Multimodal Transformer v3** - Running (42% complete)
- **Audio Classification Model** - Completed
- **Vision Transformer Baseline** - Completed
- **Large Language Model Fine-tune** - Queued
- **Multimodal Fusion Experiment** - Created
- **Video Action Recognition** - Failed

### ⚙️ Training Jobs & Metrics
- Jobs created for running/completed/failed experiments
- Realistic metrics generated using simulation
- Progress tracking data included

## Disabling Auto-Seed

To disable automatic seeding on startup, set in `.env`:

```env
AUTO_SEED=false
```

## Resetting Database

To start fresh:

```bash
# Delete database file (SQLite)
rm backend/ml_dashboard.db

# Or drop tables (PostgreSQL)
# Then restart the server - it will auto-seed again
```

## Custom Seeding

Edit `backend/app/utils/seed_data.py` to customize the demo data.
