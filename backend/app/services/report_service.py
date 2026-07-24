"""Citizen reporting domain service."""

import uuid
from typing import List, Optional
from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.enums import ReportCategory, ReportStatus, SeverityLevel
from app.models.report import CitizenReport
from app.schemas.report import ReportCreate


class ReportService:
    """Service handling citizen report lifecycle, verification, and spatial clustering."""

    @classmethod
    async def create_report(
        cls, session: AsyncSession, report_in: ReportCreate, user_id: Optional[uuid.UUID] = None
    ) -> CitizenReport:
        """Create a new geotagged citizen incident report."""
        report = CitizenReport(
            user_id=user_id,
            title=report_in.title,
            description=report_in.description,
            category=report_in.category,
            severity=report_in.severity,
            status=ReportStatus.PENDING,
            location=f"SRID=4326;POINT({report_in.longitude} {report_in.latitude})",
            media_urls=report_in.media_urls,
        )
        session.add(report)
        await session.commit()
        await session.refresh(report)
        return report

    @classmethod
    async def get_report_by_id(cls, session: AsyncSession, report_id: uuid.UUID) -> CitizenReport:
        """Retrieve a specific report by ID."""
        result = await session.execute(
            select(CitizenReport).where(CitizenReport.id == report_id)
        )
        report = result.scalars().first()
        if not report:
            raise NotFoundException(f"Citizen report '{report_id}' not found.")
        return report

    @classmethod
    async def list_reports(
        cls,
        session: AsyncSession,
        category: Optional[ReportCategory] = None,
        status: Optional[ReportStatus] = None,
        limit: int = 50,
    ) -> List[CitizenReport]:
        """List citizen reports with optional filtering."""
        query = select(CitizenReport)
        if category:
            query = query.where(CitizenReport.category == category)
        if status:
            query = query.where(CitizenReport.status == status)

        query = query.order_by(CitizenReport.created_at.desc()).limit(limit)
        result = await session.execute(query)
        return list(result.scalars().all())

    @classmethod
    async def update_report_status(
        cls, session: AsyncSession, report_id: uuid.UUID, status: ReportStatus
    ) -> CitizenReport:
        """Verify or change the operational status of a citizen report."""
        report = await cls.get_report_by_id(session, report_id)
        report.status = status
        await session.commit()
        await session.refresh(report)
        return report
