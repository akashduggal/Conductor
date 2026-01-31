# Vercel FastAPI entrypoint: detector requires 'app' to be defined in this file.
from fastapi import FastAPI
from app.main import app as _app

app: FastAPI = _app
