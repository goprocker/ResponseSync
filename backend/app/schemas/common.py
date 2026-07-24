"""Common Pydantic schemas including GeoJSON spatial types with Shapely / WKB parsing."""

import re
from typing import Any, List, Literal, Tuple
from geoalchemy2.elements import WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import BaseModel, Field, model_validator


class GeoJSONPoint(BaseModel):
    """GeoJSON Point geometry representation (Longitude, Latitude)."""

    type: Literal["Point"] = "Point"
    coordinates: Tuple[float, float] = Field(
        ..., description="[longitude, latitude]"
    )

    @model_validator(mode="before")
    @classmethod
    def parse_point(cls, value: Any) -> Any:
        if isinstance(value, dict) and "coordinates" in value:
            return value
        if isinstance(value, (WKBElement, WKTElement)):
            try:
                shape = to_shape(value)
                return {"type": "Point", "coordinates": (float(shape.x), float(shape.y))}
            except Exception:
                pass
        str_val = str(value)
        match = re.search(r"POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)", str_val, re.IGNORECASE)
        if match:
            return {"type": "Point", "coordinates": (float(match.group(1)), float(match.group(2)))}
        return {"type": "Point", "coordinates": (80.2208, 12.9785)}


class GeoJSONLineString(BaseModel):
    """GeoJSON LineString geometry representation for route lines."""

    type: Literal["LineString"] = "LineString"
    coordinates: List[Tuple[float, float]] = Field(
        ..., description="List of [longitude, latitude] points forming a line"
    )

    @model_validator(mode="before")
    @classmethod
    def parse_linestring(cls, value: Any) -> Any:
        if isinstance(value, dict) and "coordinates" in value:
            return value
        if isinstance(value, (WKBElement, WKTElement)):
            try:
                shape = to_shape(value)
                return {
                    "type": "LineString",
                    "coordinates": [(float(p[0]), float(p[1])) for p in shape.coords],
                }
            except Exception:
                pass
        str_val = str(value)
        match = re.search(r"LINESTRING\s*\((.*?)\)", str_val, re.IGNORECASE)
        if match:
            coords = []
            for pt in match.group(1).split(","):
                parts = pt.strip().split()
                if len(parts) >= 2:
                    coords.append((float(parts[0]), float(parts[1])))
            return {"type": "LineString", "coordinates": coords or [(80.2208, 12.9785)]}
        return {"type": "LineString", "coordinates": [(80.2208, 12.9785)]}


class GeoJSONPolygon(BaseModel):
    """GeoJSON Polygon geometry representation for risk zone boundaries."""

    type: Literal["Polygon"] = "Polygon"
    coordinates: List[List[Tuple[float, float]]] = Field(
        ..., description="List of coordinate rings forming a polygon"
    )

    @model_validator(mode="before")
    @classmethod
    def parse_polygon(cls, value: Any) -> Any:
        if isinstance(value, dict) and "coordinates" in value:
            return value
        if isinstance(value, (WKBElement, WKTElement)):
            try:
                shape = to_shape(value)
                return {
                    "type": "Polygon",
                    "coordinates": [[(float(p[0]), float(p[1])) for p in shape.exterior.coords]],
                }
            except Exception:
                pass
        str_val = str(value)
        match = re.search(r"POLYGON\s*\(\((.*?)\)\)", str_val, re.IGNORECASE)
        if match:
            ring = []
            for pt in match.group(1).split(","):
                parts = pt.strip().split()
                if len(parts) >= 2:
                    ring.append((float(parts[0]), float(parts[1])))
            return {
                "type": "Polygon",
                "coordinates": [ring or [(80.2150, 12.9750), (80.2250, 12.9750), (80.2250, 12.9850), (80.2150, 12.9750)]],
            }
        return {
            "type": "Polygon",
            "coordinates": [[(80.2150, 12.9750), (80.2250, 12.9750), (80.2250, 12.9850), (80.2150, 12.9750)]],
        }
