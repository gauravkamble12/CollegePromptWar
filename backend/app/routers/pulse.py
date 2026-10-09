from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.report import CivicReport, ReportStatus
from backend.app.models.pulse import WeatherAlertRecord, ProviderHealthRecord
from backend.app.schemas.pulse import CityPulseResponse, ProviderStatusResponse, WeatherAlertItem
from backend.app.adapters.weather_adapter import fetch_live_weather

router = APIRouter(prefix="/pulse", tags=["Live City Pulse"])

@router.get("", response_model=CityPulseResponse)
async def get_city_pulse(db: Session = Depends(get_db)):
    # 1. Fetch weather via adapter
    weather_data = await fetch_live_weather()

    # 2. Query active weather alerts
    alerts_raw = db.query(WeatherAlertRecord).order_by(WeatherAlertRecord.observed_at.desc()).limit(3).all()
    alerts = [WeatherAlertItem.model_validate(a) for a in alerts_raw]

    # 3. Query civic reports statistics
    recent_count = db.query(CivicReport).filter(
        CivicReport.status.in_([ReportStatus.SUBMITTED, ReportStatus.PENDING_REVIEW, ReportStatus.VERIFIED])
    ).count()
    
    resolved_count = db.query(CivicReport).filter(
        CivicReport.status == ReportStatus.RESOLVED
    ).count()

    # Top active hazard categories
    active_reps = db.query(CivicReport.category).filter(
        CivicReport.status.in_([ReportStatus.PENDING_REVIEW, ReportStatus.VERIFIED])
    ).limit(5).all()
    top_hazards = [str(r[0].value) for r in active_reps]

    # 4. Providers health
    providers_raw = db.query(ProviderHealthRecord).all()
    providers = [
        ProviderStatusResponse(
            provider_name=p.provider_name,
            is_operational=bool(p.is_operational),
            latency_ms=p.latency_ms,
            last_checked_at=p.last_checked_at,
            status_message=p.status_message
        )
        for p in providers_raw
    ]

    return CityPulseResponse(
        city="Pune, Maharashtra",
        current_temperature_c=weather_data.get("temperature_c"),
        weather_condition=weather_data.get("condition"),
        air_quality_summary="Moderate (AQI ~92, Good for outdoor exploration)",
        active_weather_alerts=alerts,
        recent_civic_reports_count=recent_count,
        resolved_civic_reports_count=resolved_count,
        top_active_hazards=top_hazards or ["road_damage", "broken_streetlights"],
        providers=providers,
        pulse_timestamp=datetime.now(timezone.utc),
        is_live_data=weather_data.get("is_live", False),
        last_sync_note=weather_data.get("source", "Open-Meteo Integration")
    )
