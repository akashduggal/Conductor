# Deploy ML Dashboard Backend on Vercel

Step-by-step guide to deploy the FastAPI backend on Vercel without crashes.

---

## Prerequisites

- A [Vercel](https://vercel.com) account
- Git repository with the ML Dashboard code (or use Vercel CLI)
- A **hosted PostgreSQL** database (Vercel serverless does not support SQLite; the filesystem is ephemeral)

---

## Step 1: Create a Hosted PostgreSQL Database

Vercel serverless functions have no persistent filesystem. You **must** use a hosted database.

### Option A: Neon (recommended, free tier)

1. Go to [neon.tech](https://neon.tech) and sign up.
2. Create a new project and copy the **connection string**.
3. For SQLAlchemy async, use the **pooled** connection string and ensure it uses the `asyncpg` driver format:
   - **Format:** `postgresql+asyncpg://USER:PASSWORD@HOST/DATABASE?sslmode=require`
   - In Neon dashboard you can copy the connection string and replace `postgresql://` with `postgresql+asyncpg://`.

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Settings → Database**, copy the **Connection string (URI)**.
3. Replace `postgresql://` with `postgresql+asyncpg://` and add `?sslmode=require` if needed.

**Save this URL** — you will add it as `DATABASE_URL` in Vercel.

---

## Step 2: Create a New Vercel Project for the Backend

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your Git repository (GitHub, GitLab, or Bitbucket).
3. **Important:** Do **not** deploy yet. First configure the project.

---

## Step 3: Set the Root Directory to `backend`

1. In the Vercel project **Settings**, open **General**.
2. Under **Root Directory**, click **Edit**.
3. Enter: **`backend`**
4. Save.

This makes Vercel treat the `backend` folder as the project root so it finds `app/index.py`, `requirements.txt`, and `vercel.json`.

---

## Step 4: Configure Environment Variables

In the Vercel project, go to **Settings → Environment Variables** and add:

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` | `postgresql+asyncpg://USER:PASSWORD@HOST/DB?sslmode=require` | From Step 1 (Neon or Supabase). **Required.** |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` | Your frontend URL. **If you see "error parsing value for field cors_origins"**, the live build may be old — set this to a **JSON array** instead: `["https://your-frontend.vercel.app"]` (then redeploy). |
| `API_V1_PREFIX` | `/api/v1` | Leave as-is unless you changed it in code. |
| `SECRET_KEY` | A long random string | Generate one (e.g. `openssl rand -hex 32`) for production. |
| `AUTO_SEED` | `true` | Set to `true` to seed demo data on first deploy; set to `false` after first run or for production. |
| `REDIS_URL` | (optional) | Not used by the API today; you can leave unset or use [Upstash](https://upstash.com) later. |

Apply these to **Production** (and optionally Preview if you use branches).

---

## Step 5: Deploy

1. Go to the **Deployments** tab.
2. If you already deployed before setting Root Directory and env vars, trigger a **Redeploy** (⋯ → Redeploy) so the new settings apply.
3. Otherwise, push a commit or click **Deploy** to start the first deployment.

Wait for the build to finish. The backend will be available at:

- **URL:** `https://<your-project-name>.vercel.app`

---

## Step 6: Create Database Tables (First-Time Setup)

The app runs `init_db()` on startup, which creates tables if they don’t exist. With **PostgreSQL**, that runs on the first request (cold start).

- On Vercel, the app skips DB init at startup; run migrations once to create tables (see below).
- **Run Alembic migrations once** from your machine against the same `DATABASE_URL` you set in Vercel:

  ```bash
  cd backend
  export DATABASE_URL="postgresql+asyncpg://..."
  alembic upgrade head
  ```

---

## Step 7: Verify the Deployment

1. **Health check:**  
   Open in a browser or with curl:
   ```text
   https://<your-project-name>.vercel.app/health
   ```
   You should see: `{"status":"healthy"}`.

2. **API root:**  
   ```text
   https://<your-project-name>.vercel.app/
   ```
   Should return a JSON message and link to `/docs`.

3. **API docs:**  
   ```text
   https://<your-project-name>.vercel.app/docs
   ```
   Swagger UI should load.

4. **API v1 example:**  
   ```text
   https://<your-project-name>.vercel.app/api/v1/stats/overview
   ```
   Should return stats (or empty data if not seeded).

---

## Step 8: Connect Your Frontend

1. Deploy your frontend (e.g. same repo with Root Directory `frontend`, or a separate Vercel project).
2. Set the frontend’s **API base URL** to your backend URL, e.g. `https://<your-project-name>.vercel.app`.
3. In Vercel **backend** env vars, set **CORS_ORIGINS** to your frontend URL, e.g. `https://your-frontend.vercel.app` (comma-separated if you have several).
4. Redeploy the backend after changing **CORS_ORIGINS** so the new value is applied.

---

## Deploying via Vercel CLI (recommended if Git deploy uses old code)

Deploying from the **backend folder** with the CLI uses your **local** `backend/` code (no Git cache), so the fixed config is guaranteed to be used.

1. Install the CLI: `npm i -g vercel`
2. Log in: `vercel login`
3. From your machine, go into the backend folder and deploy:
   ```bash
   cd "/path/to/ML Dashboard/backend"
   vercel
   ```
4. First time: follow prompts (link to existing project or create new; no need to set Root Directory — you're already in `backend`).
5. Add environment variables (if not already set in the dashboard):
   ```bash
   vercel env add DATABASE_URL
   vercel env add CORS_ORIGINS
   vercel env add SECRET_KEY
   vercel env add AUTO_SEED
   ```
   For `CORS_ORIGINS` you can use a plain URL: `https://your-frontend.vercel.app`
6. Deploy to production:
   ```bash
   vercel --prod
   ```

The deployed app will use the code in your local `backend/` folder, including the config that reads CORS from `os.environ` (no JSON needed).

---

## What Was Changed for Vercel

- **`backend/api/index.py`** — Serverless entrypoint that exports the FastAPI `app`; used with `builds` + `routes` so all requests hit the Python function.
- **`backend/index.py`** and **`backend/app/index.py`** — Alternative entrypoints for framework auto-detection.
- **`backend/vercel.json`** — Sets `installCommand`, `builds` (Python function from `api/index.py`), and `routes` (all paths → `api/index.py`).
- **`backend/requirements.txt`** — Added `asyncpg` for PostgreSQL when using `postgresql+asyncpg://` in `DATABASE_URL`. PyTorch remains commented out to keep the bundle under Vercel’s size limit.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| **Function size > 250 MB** | Ensure `torch`, `torchaudio`, and `torchvision` are **not** in `requirements.txt`. Use only the dependencies needed at runtime. |
| **Database connection errors** | Use `postgresql+asyncpg://...` (with `asyncpg`). Ensure `DATABASE_URL` is set in Vercel and that the DB allows connections from Vercel’s IPs (Neon/Supabase do by default with SSL). |
| **CORS errors from frontend** | Set `CORS_ORIGINS` to the exact frontend origin (e.g. `https://your-app.vercel.app`), then redeploy the backend. |
| **404 NOT_FOUND on root or any path** | Ensure **Root Directory** is `backend`. The repo uses `vercel.json` with `builds` + `routes` so all requests go to `api/index.py`. Redeploy after changes. If 404 persists, check **Deployments → Function Logs** for build/import errors. |
| **Tables don’t exist** | Run `init_db()` once (by calling the API so the app starts) or run Alembic migrations locally against `DATABASE_URL`. |

---

## Summary Checklist

- [ ] Hosted Postgres created (Neon or Supabase); `DATABASE_URL` uses `postgresql+asyncpg://`
- [ ] Vercel project created; **Root Directory** = `backend`
- [ ] Env vars set: `DATABASE_URL`, `CORS_ORIGINS`, `SECRET_KEY`, `AUTO_SEED`
- [ ] Deployed; `/health` returns `{"status":"healthy"}`
- [ ] Frontend API base URL points to backend URL; backend `CORS_ORIGINS` includes frontend origin
