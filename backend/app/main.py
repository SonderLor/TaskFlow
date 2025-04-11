from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
import os
from typing import List

# Загрузка конфигурации из переменных окружения
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://taskflow:taskflow_password@postgres:5432/taskflow")
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
API_PREFIX = os.getenv("API_PREFIX", "/api")

# Преобразование строки в список для CORS_ORIGINS
cors_origins_str = os.getenv("CORS_ORIGINS", '["http://localhost", "http://localhost:3000"]')
try:
    import json
    CORS_ORIGINS = json.loads(cors_origins_str)
except json.JSONDecodeError:
    CORS_ORIGINS = ["http://localhost", "http://localhost:3000"]

app = FastAPI(
    title="TaskFlow API",
    description="API для системы отслеживания задач",
    version="0.1.0",
    debug=DEBUG,
    docs_url="/docs",  # Устанавливаем путь для Swagger UI
    openapi_url="/openapi.json"  # Устанавливаем путь для OpenAPI JSON
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to TaskFlow API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
