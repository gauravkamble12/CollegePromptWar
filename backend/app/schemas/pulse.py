from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class WeatherAlertItem(BaseModel):
    id: int
    severity: str
    title: str
    description: str
    temperature_c: Optional[float]
    weather_condition: Optional[str]
    wind_speed_kmh: Optional[float]
    source_attribution: str
    observed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProviderStatusResponse(BaseModel):
    provider_name: str
    is_operational: bool
    latency_ms: float
    last_checked_at: datetime
    status_message: str

    model_config = ConfigDict(from_attributes=True)

class CityPulseResponse(BaseModel):
    city: str
    current_temperature_c: Optional[float]
    weather_condition: Optional[str]
    air_quality_summary: Optional[str]
    active_weather_alerts: List[WeatherAlertItem]
    recent_civic_reports_count: int
    resolved_civic_reports_count: int
    top_active_hazards: List[str]
    providers: List[ProviderStatusResponse]
    pulse_timestamp: datetime
    is_live_data: bool
    last_sync_note: str
