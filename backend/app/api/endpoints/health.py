"""Health check endpoint router."""

from fastapi import APIRouter, status
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
    return HealthResponse(status="healthy")
