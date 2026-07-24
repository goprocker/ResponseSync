"""Hospitals and medical facilities API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalResponse

router = APIRouter()


@router.get(
    "/hospitals",
    response_model=List[HospitalResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Hospital Capacity",
    description="Returns medical facilities, available beds, ICU capacity, and emergency status.",
)
async def get_hospitals(db: AsyncSession = Depends(get_db)) -> List[HospitalResponse]:
    """Retrieve hospital locations and bed availability."""
    result = await db.execute(select(Hospital))
    return list(result.scalars().all())
