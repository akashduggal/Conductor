# ML Training Dashboard

A production-ready monorepo application for managing ML training experiments, datasets, and real-time metrics visualization.

## 🏗️ Monorepo Structure

```
ml-dashboard/
├── frontend/          # React + TypeScript frontend
├── backend/           # FastAPI Python backend
├── docker-compose.yml # Full stack orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **pnpm**
- **Python 3.11+**
- **Docker** and **Docker Compose** (optional, for full stack)

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up

# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your settings (optional, defaults work for demo)

# Seed database with demo data (optional - auto-seeds on first run)
python -m app.utils.seed_data

# Run backend
uvicorn app.main:app --reload
```

**Note**: The database will automatically seed with demo data on first startup if empty. This includes:
- 5 sample datasets
- 6 sample experiments with various statuses
- Training jobs with realistic metrics

#### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 📦 Monorepo Commands

From the root directory:

```bash
# Install all dependencies
pnpm install:all

# Run frontend
pnpm dev

# Run backend
pnpm dev:backend

# Run both (parallel)
pnpm dev:all

# Build frontend
pnpm build
```

## 🎯 Features

### Backend (FastAPI)
- ✅ RESTful API with automatic OpenAPI documentation
- ✅ Async SQLAlchemy with PostgreSQL/SQLite support
- ✅ Real-time metrics via WebSocket
- ✅ Background job processing for training simulation
- ✅ Redis integration (ready for caching/queues)
- ✅ Comprehensive error handling and validation

### Frontend (React + TypeScript)
- ✅ Modern React 18 with TypeScript
- ✅ Real-time metrics visualization with Recharts
- ✅ Experiment management and comparison
- ✅ Dataset management
- ✅ Responsive design with Tailwind CSS
- ✅ React Query for data fetching

## 📚 API Documentation

When the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🗄️ Database

The backend uses SQLAlchemy with async support. By default, it uses SQLite for development. For production, configure PostgreSQL in `.env`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/mldb
```

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL=sqlite+aiosqlite:///./ml_dashboard.db
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:5173
SECRET_KEY=your-secret-key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
pnpm test
```

## 📝 Project Structure

### Backend

```
backend/
├── app/
│   ├── api/          # API routes
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   ├── utils/        # Utilities
│   ├── config.py     # Configuration
│   ├── database.py   # Database setup
│   └── main.py       # FastAPI app
├── alembic/          # Database migrations
└── requirements.txt
```

### Frontend

```
frontend/
├── src/
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom hooks
│   ├── services/     # API services
│   ├── types/        # TypeScript types
│   └── utils/        # Utilities
└── package.json
```

## 🐳 Docker

### Build Images

```bash
docker-compose build
```

### Run Services

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f
```

### Stop Services

```bash
docker-compose down
```

## 📄 License

MIT
