from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Настройка CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/", tags=["Health"])
async def root():
    return {"message": "Welcome to TaskFlow API"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version="1.0.0",
        description="TaskFlow API - система управления задачами",
        routes=app.routes,
    )

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
