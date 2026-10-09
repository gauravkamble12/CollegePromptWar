from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from backend.app.database import Base

class WeatherAlertRecord(Base):
    __tablename__ = "weather_alerts"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), default="Pune", index=True)
    severity = Column(String(50), default="advisory") # info, advisory, watch, warning
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    temperature_c = Column(Float, nullable=True)
    weather_condition = Column(String(100), nullable=True) # e.g. "Scattered Showers", "Sunny", "Overcast"
    wind_speed_kmh = Column(Float, nullable=True)
    source_attribution = Column(String(200), default="Open-Meteo Meteorological Service")
    observed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)

class ProviderHealthRecord(Base):
    __tablename__ = "provider_health"

    id = Column(Integer, primary_key=True, index=True)
    provider_name = Column(String(100), unique=True, index=True, nullable=False) # "open_meteo", "osrm_routing", "overpass_osm"
    is_operational = Column(Integer, default=1)
    latency_ms = Column(Float, default=0.0)
    last_checked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status_message = Column(String(255), default="Operational")
