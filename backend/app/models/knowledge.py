"""Decision Knowledge Base model for matching live disasters against simulated outcomes."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Float, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.simulation import Simulation


class DecisionKnowledge(Base):
    """Institutional Knowledge Base entry derived from simulation outcomes."""

    __tablename__ = "decision_knowledge"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    simulation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="SET NULL"), nullable=True
    )

    scenario_vector: Mapped[dict] = mapped_column(
        JSONB, default=dict, nullable=False, help_text="Normalized parameter vector for similarity matching"
    )
    input_conditions: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    recommended_actions: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    
    outcome_effectiveness: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    lessons_learned: Mapped[str] = mapped_column(Text, default="", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    # Relationships
    simulation: Mapped[Optional["Simulation"]] = relationship(
        "Simulation", back_populates="knowledge_entries"
    )

    def __repr__(self) -> str:
        return f"<DecisionKnowledge entry {self.id} - Effectiveness: {self.outcome_effectiveness}>"
