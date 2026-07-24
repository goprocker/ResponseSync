"""Enumeration types for database models and API schemas."""

import enum


class UserRole(str, enum.Enum):
    """User roles for authentication and access control."""
    CITIZEN = "CITIZEN"
    AUTHORITY = "AUTHORITY"
    ADMIN = "ADMIN"


class ReportCategory(str, enum.Enum):
    """Categories for citizen hazard and emergency reports."""
    FLOOD = "FLOOD"
    ROAD_BLOCKED = "ROAD_BLOCKED"
    MEDICAL_EMERGENCY = "MEDICAL_EMERGENCY"
    SHELTER_NEEDED = "SHELTER_NEEDED"
    HAZARD = "HAZARD"


class SeverityLevel(str, enum.Enum):
    """Severity levels for disaster events and reports."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ReportStatus(str, enum.Enum):
    """Lifecycle status of a citizen report."""
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    DISPATCHED = "DISPATCHED"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class RiskLevel(str, enum.Enum):
    """Flood risk assessment levels."""
    SAFE = "SAFE"
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    SEVERE = "SEVERE"


class ResourceType(str, enum.Enum):
    """Types of emergency response equipment and teams."""
    RESCUE_BOAT = "RESCUE_BOAT"
    AMBULANCE = "AMBULANCE"
    FIRE_TRUCK = "FIRE_TRUCK"
    FOOD_SUPPLIES = "FOOD_SUPPLIES"
    PERSONNEL = "PERSONNEL"


class ResourceStatus(str, enum.Enum):
    """Operational status of an emergency resource."""
    AVAILABLE = "AVAILABLE"
    DEPLOYED = "DEPLOYED"
    MAINTENANCE = "MAINTENANCE"


class EmergencyStatus(str, enum.Enum):
    """Hospital emergency capacity status."""
    NORMAL = "NORMAL"
    BUSY = "BUSY"
    FULL = "FULL"
