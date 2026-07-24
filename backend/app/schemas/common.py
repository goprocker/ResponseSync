"""Common Pydantic schemas including GeoJSON spatial types."""

from typing import List, Literal, Tuple
from pydantic import BaseModel, Field


class GeoJSONPoint(BaseModel):
    """GeoJSON Point geometry representation (Longitude, Latitude)."""

    type: Literal["Point"] = "Point"
    coordinates: Tuple[float, float] = Field(
        ..., description="[longitude, latitude]"
    )


class GeoJSONLineString(BaseModel):
    """GeoJSON LineString geometry representation for route lines."""

    type: Literal["LineString"] = "LineString"
    coordinates: List[Tuple[float, float]] = Field(
        ..., description="List of [longitude, latitude] points forming a line"
    )


class GeoJSONPolygon(BaseModel):
    """GeoJSON Polygon geometry representation for risk zone boundaries."""

    type: Literal["Polygon"] = "Polygon"
    coordinates: List[List[Tuple[float, float]]] = Field(
        ..., description="List of coordinate rings forming a polygon"
    )
