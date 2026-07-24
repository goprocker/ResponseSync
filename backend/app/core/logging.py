"""Structured logging setup for ResponSync backend."""

import logging
import sys


def setup_logging(level: int = logging.INFO) -> None:
    """Configure structured console logging across the application."""
    log_format = (
        "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    )

    logging.basicConfig(
        level=level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
        force=True,
    )

    # Silence overly verbose third-party loggers if necessary
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


logger = logging.getLogger("responsync")
