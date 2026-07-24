"""Risk zone and inundation heatmap endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.risk_zone import RiskZone
from app.schemas.risk_zone import RiskZoneResponse

router = APIRouter()


@router.get(
    "/risk",
    response_model=List[RiskZoneResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Risk Zones & Flood Boundaries",
    description="Returns all active spatial risk zones, flood depths, and impacted population estimates.",
)
async def get_risk_zones(db: AsyncSession = Depends(get_db)) -> List[RiskZoneResponse]:
    """Retrieve all flood risk polygon zones."""
    result = await db.execute(select(RiskZone))
    return list(result.scalars().all())
