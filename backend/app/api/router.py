"""Main API router combining all endpoint routers."""

from fastapi import APIRouter
from app.api.endpoints.health import router as health_router

api_router = APIRouter()

# Include health router (accessible at /health and /api/v1/health)
api_router.include_router(health_router, tags=["Health"])
