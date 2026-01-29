# ML Dashboard Backend

FastAPI backend for the ML Training Dashboard.

## Quick Start

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### Database Setup

The database will be automatically initialized on first startup. For manual seeding:

```bash
# Seed database with demo data
python -m app.utils.seed_data

# Or using the script
./scripts/seed.sh
```

### Running the Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Seeding

The database will automatically seed with demo data on first startup if empty. To manually seed:

```bash
python -m app.utils.seed_data
```

This creates:
- 5 sample datasets
- 6 sample experiments (various statuses)
- Training jobs with realistic metrics

## Environment Variables

See `.env.example` for all available configuration options.

## Development

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Running Tests

```bash
pytest
```
