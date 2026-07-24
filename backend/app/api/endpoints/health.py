"""Health check endpoint router."""

from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check Endpoint",
    description="Returns operational status of the service.",
)
async def health_check() -> HealthResponse:
    """Return healthy status confirmation."""
    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
        services={
            "database": "online",
            "api_gateway": "online",
            "ai_engine": "ready",
            "gis_mapping": "online",
        },
    )

