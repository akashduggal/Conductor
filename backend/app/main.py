from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api import api_router

app = FastAPI(
    title="ML Training Dashboard API",
    description="API for ML Training Dashboard & Workflow Orchestrator",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
async def startup_event():
    await init_db()
    
    # Auto-seed database if empty (for demo purposes)
    # Set AUTO_SEED=false in .env to disable
    import os
    auto_seed = os.getenv("AUTO_SEED", "true").lower() == "true"
    
    if auto_seed:
        from sqlalchemy import select, func
        from app.models.dataset import Dataset
        from app.database import AsyncSessionLocal
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(func.count(Dataset.id)))
            count = result.scalar() or 0
            
            if count == 0:
                print("📦 Database is empty. Auto-seeding with demo data...")
                try:
                    from app.utils.seed_data import seed_datasets, seed_experiments, seed_jobs_and_metrics
                    await seed_datasets(db)
                    await seed_experiments(db)
                    await seed_jobs_and_metrics(db)
                    print("✅ Demo data seeded successfully!")
                except Exception as e:
                    print(f"⚠️  Error seeding database: {e}")
                    print("   You can manually seed with: python -m app.utils.seed_data")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {
        "message": "ML Training Dashboard API",
        "docs": "/docs",
        "version": "1.0.0",
    }
