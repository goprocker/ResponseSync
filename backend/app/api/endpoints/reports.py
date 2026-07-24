"""Citizen reporting API endpoints."""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.enums import ReportCategory, ReportStatus
from app.schemas.report import ReportCreate, ReportResponse, ReportStatusUpdate
from app.services.report_service import ReportService

router = APIRouter()


@router.post(
    "/reports",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Citizen Hazard Report",
    description="Allows citizens or emergency personnel to submit a geotagged hazard or emergency report.",
)
async def create_report(
    report_in: ReportCreate, db: AsyncSession = Depends(get_db)
) -> ReportResponse:
    """Submit a new citizen report."""
    return await ReportService.create_report(db, report_in)


@router.get(
    "/reports",
    response_model=List[ReportResponse],
    status_code=status.HTTP_200_OK,
    summary="List Citizen Hazard Reports",
    description="Returns geotagged citizen reports with optional filtering by category and status.",
)
async def list_reports(
    category: Optional[ReportCategory] = Query(None, description="Filter by report category"),
    report_status: Optional[ReportStatus] = Query(None, alias="status", description="Filter by report status"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> List[ReportResponse]:
    """Retrieve citizen report feed."""
    return await ReportService.list_reports(db, category=category, status=report_status, limit=limit)


@router.get(
    "/reports/{report_id}",
    response_model=ReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Specific Citizen Report",
)
async def get_report(report_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> ReportResponse:
    """Get report details by UUID."""
    return await ReportService.get_report_by_id(db, report_id)


@router.patch(
    "/reports/{report_id}/status",
    response_model=ReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify / Update Report Status",
    description="Updates report lifecycle status (VERIFIED, DISPATCHED, RESOLVED, REJECTED).",
)
async def update_report_status(
    report_id: uuid.UUID,
    status_update: ReportStatusUpdate,
    db: AsyncSession = Depends(get_db),
) -> ReportResponse:
    """Authority verification endpoint."""
    return await ReportService.update_report_status(db, report_id, status_update.status)
