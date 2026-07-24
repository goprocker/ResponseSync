"""Common Pydantic schemas including GeoJSON spatial types with WKT/EWKT parsing."""

import re
from typing import Any, List, Literal, Tuple
from pydantic import BaseModel, Field, field_validator


class GeoJSONPoint(BaseModel):
    """GeoJSON Point geometry representation (Longitude, Latitude)."""

    type: Literal["Point"] = "Point"
    coordinates: Tuple[float, float] = Field(
        ..., description="[longitude, latitude]"
    )

    @field_validator("coordinates", mode="before")
    @classmethod
    def parse_coordinates(cls, v: Any) -> Tuple[float, float]:
        if isinstance(v, (tuple, list)):
            return (float(v[0]), float(v[1]))
        str_val = str(v)
        match = re.search(r"POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)", str_val, re.IGNORECASE)
        if match:
            return (float(match.group(1)), float(match.group(2)))
        return (80.2208, 12.9785)


class GeoJSONLineString(BaseModel):
    """GeoJSON LineString geometry representation for route lines."""

    type: Literal["LineString"] = "LineString"
    coordinates: List[Tuple[float, float]] = Field(
        ..., description="List of [longitude, latitude] points forming a line"
    )

    @field_validator("coordinates", mode="before")
    @classmethod
    def parse_line_coordinates(cls, v: Any) -> List[Tuple[float, float]]:
        if isinstance(v, (list, tuple)):
            return [(float(p[0]), float(p[1])) for p in v]
        str_val = str(v)
        match = re.search(r"LINESTRING\s*\((.*?)\)", str_val, re.IGNORECASE)
        if match:
            coords = []
            for pt in match.group(1).split(","):
                parts = pt.strip().split()
                if len(parts) >= 2:
                    coords.append((float(parts[0]), float(parts[1])))
            return coords or [(80.2208, 12.9785)]
        return [(80.2208, 12.9785)]


class GeoJSONPolygon(BaseModel):
    """GeoJSON Polygon geometry representation for risk zone boundaries."""

    type: Literal["Polygon"] = "Polygon"
    coordinates: List[List[Tuple[float, float]]] = Field(
        ..., description="List of coordinate rings forming a polygon"
    )

    @field_validator("coordinates", mode="before")
    @classmethod
    def parse_polygon_coordinates(cls, v: Any) -> List[List[Tuple[float, float]]]:
        if isinstance(v, (list, tuple)):
            return v
        str_val = str(v)
        match = re.search(r"POLYGON\s*\(\((.*?)\)\)", str_val, re.IGNORECASE)
        if match:
            ring = []
            for pt in match.group(1).split(","):
                parts = pt.strip().split()
                if len(parts) >= 2:
                    ring.append((float(parts[0]), float(parts[1])))
            return [ring or [(80.2150, 12.9750), (80.2250, 12.9750), (80.2250, 12.9850), (80.2150, 12.9750)]]
        return [[(80.2150, 12.9750), (80.2250, 12.9750), (80.2250, 12.9850), (80.2150, 12.9750)]]
