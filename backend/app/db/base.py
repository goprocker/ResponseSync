"""SQLAlchemy 2.0 declarative base setup with spatial / GeoAlchemy2 readiness."""

from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.compiler import compiles
from geoalchemy2.functions import GenericFunction


@compiles(GenericFunction, "sqlite")
def _compile_geoalchemy_function_sqlite(element, compiler, **kw):
    """Fallback compiler intercepting GeoAlchemy2 functions under SQLite dialect (testing)."""
    if getattr(element, "name", "").upper() in (
        "GEOMFROMEWKT",
        "ST_GEOMFROMEWKT",
        "ST_GEOMFROMTEXT",
        "ST_ASTEXT",
    ):
        if element.clauses and len(element.clauses.clauses) > 0:
            return compiler.process(element.clauses.clauses[0], **kw)
        return "''"
    return compiler.visit_function(element, **kw)


class Base(AsyncAttrs, DeclarativeBase):
    """Base declarative class for all SQLAlchemy models in ResponSync."""

    pass
