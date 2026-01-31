# Repo-root FastAPI entrypoint for Vercel Git deploy when Root Directory is not set.
# Ensures backend is on path so "app.main" resolves to backend/app/main.py.
import os
import sys

_backend = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, os.path.abspath(_backend))

from fastapi import FastAPI
from app.main import app as _app

app: FastAPI = _app
