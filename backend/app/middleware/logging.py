"""Request logging middleware to log HTTP request metadata and execution time."""

import logging
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("responsync")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for recording HTTP request details and duration."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        response = await call_next(request)
        process_time_ms = (time.time() - start_time) * 1000

        logger.info(
            f"{request.method} {request.url.path} - Status: {response.status_code} - Completed in {process_time_ms:.2f}ms"
        )
        response.headers["X-Process-Time-MS"] = f"{process_time_ms:.2f}"
        return response
