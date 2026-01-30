import asyncio
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import api_router

app = FastAPI(
    title="ML Training Dashboard API",
    description="API for ML Training Dashboard & Workflow Orchestrator",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
async def startup_event():
    # Capture main event loop for TrainingService (notifications from background thread)
    from app.services.training import TrainingService
    try:
        TrainingService._loop = asyncio.get_running_loop()
    except RuntimeError:
        pass
    # On Vercel (or SKIP_DB_INIT), skip auto-seed
    if os.getenv("VERCEL") == "1" or os.getenv("SKIP_DB_INIT", "").lower() in ("1", "true", "yes"):
        return
    auto_seed = os.getenv("AUTO_SEED", "true").lower() == "true"
    if not auto_seed:
        return

    def _maybe_seed():
        from app.supabase_client import get_supabase
        from app.utils.seed_data import seed_datasets, seed_experiments, seed_jobs_and_metrics
        try:
            supabase = get_supabase()
            res = supabase.table("datasets").select("id").limit(1).execute()
            rows = res.data or []
            if len(rows) == 0:
                print("📦 Database is empty. Auto-seeding with demo data...")
                seed_datasets(supabase)
                seed_experiments(supabase)
                seed_jobs_and_metrics(supabase)
                print("✅ Demo data seeded successfully!")
        except Exception as e:
            print(f"⚠️  Error seeding database: {e}")
            print("   Create tables with supabase/schema.sql then run: python -m app.utils.seed_data")

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _maybe_seed)


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/")
def root():
    return {
        "message": "ML Training Dashboard API",
        "docs": "/docs",
        "version": "1.0.0",
    }
