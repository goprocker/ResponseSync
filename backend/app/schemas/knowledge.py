"""Pydantic schemas for DecisionKnowledge entity validation."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DecisionKnowledgeCreate(BaseModel):
    simulation_id: Optional[uuid.UUID] = None
    scenario_vector: dict
    input_conditions: dict
    recommended_actions: dict
    outcome_effectiveness: float = 0.0
    lessons_learned: str = ""


class DecisionKnowledgeResponse(BaseModel):
    id: uuid.UUID
    simulation_id: Optional[uuid.UUID] = None
    scenario_vector: dict
    input_conditions: dict
    recommended_actions: dict
    outcome_effectiveness: float
    lessons_learned: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
