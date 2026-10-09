import os
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.config import settings
from backend.app.database import Base, engine, get_db
from backend.app.data.seed_data import seed_database
from backend.app.routers import (
    auth,
    places,
    map as map_router,
    reports,
    ai,
    itinerary,
    comparison,
    pulse,
    graph
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default data
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()

    # Optionally enrich the catalogue with live OpenStreetMap places (non-blocking)
    if settings.ENABLE_OSM_SYNC:
        threading.Thread(target=_run_osm_sync, daemon=True).start()

    yield
    # Shutdown logic if any


def _run_osm_sync():
    from backend.app.services.osm_sync import sync_osm_places
    db = next(get_db())
    try:
        sync_osm_places(db)
    except Exception:
        pass
    finally:
        db.close()

app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade AI-Powered Smart City Exploration Platform with CityTrust Intelligence Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
# "*" is only safe for local development; set CORS_ORIGINS in production.
_allow_all_origins = "*" in settings.cors_origin_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=not _allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Static file serving for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(places.router, prefix=settings.API_V1_STR)
app.include_router(map_router.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(itinerary.router, prefix=settings.API_V1_STR)
app.include_router(comparison.router, prefix=settings.API_V1_STR)
app.include_router(pulse.router, prefix=settings.API_V1_STR)
app.include_router(graph.router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check(db: Session = Depends(get_db)):
    try:
        from backend.app.models.place import Place
        count = db.query(Place).count()
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": "1.0.0",
            "database": "connected",
            "places_indexed": count,
            "citytrust_engine": "active"
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }

# Serve the compiled React SPA (single-origin production deployment).
# Mounted last so it never shadows the API, uploads, or health routes above.
FRONTEND_DIST = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "frontend", "dist")
)
if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
