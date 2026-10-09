"""Small in-process sliding-window rate limiter used to protect public endpoints.

This is deliberately dependency-free and per-process, which is sufficient for a
single-instance deployment. For a multi-instance deployment swap the store for
Redis while keeping the same dependency interface.
"""
import threading
import time
from collections import defaultdict, deque
from typing import Callable, Deque, Dict

from fastapi import HTTPException, Request, status


class SlidingWindowLimiter:
    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            cutoff = now - self.window_seconds
            while hits and hits[0] <= cutoff:
                hits.popleft()
            if len(hits) >= self.max_requests:
                retry_after = max(1, int(self.window_seconds - (now - hits[0])) + 1)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please slow down and try again shortly.",
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)


def rate_limit(max_requests: int, window_seconds: int = 60) -> Callable[[Request], None]:
    """Build a FastAPI dependency that throttles callers per client IP."""
    limiter = SlidingWindowLimiter(max_requests, window_seconds)

    def dependency(request: Request) -> None:
        client = request.client.host if request.client else "unknown"
        limiter.check(client)

    return dependency
