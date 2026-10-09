from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class ItineraryGenerateRequest(BaseModel):
    city: str = "Pune"
    start_lat: Optional[float] = 18.5204
    start_lng: Optional[float] = 73.8567
    target_date: Optional[str] = "Today"
    total_hours: float = Field(default=6.0, ge=1.0, le=24.0)
    total_budget_inr: int = Field(default=1000, ge=0)
    preferred_categories: List[str] = []
    transport_mode: str = "walking"
    city_mode: str = "tourist"
    accessibility_required: bool = False
    dietary_preference: Optional[str] = None
    indoor_preferred: Optional[bool] = False

class ItineraryStopResponse(BaseModel):
    order_index: int
    place_id: Optional[int]
    name: str
    category: str
    address: str
    latitude: float
    longitude: float
    suggested_arrival: str
    duration_minutes: int
    travel_time_from_previous_min: int
    cost_inr: int
    notes: str
    data_freshness_warning: Optional[str] = None
    why_recommended: str

class ItineraryResponse(BaseModel):
    title: str
    city: str
    total_hours: float
    total_budget_inr: int
    total_estimated_cost: int
    transport_mode: str
    city_mode: str
    stops: List[ItineraryStopResponse]
    responsible_travel_score: float
    weather_summary: Optional[str] = None
    alternatives: List[str] = []

class SavedItineraryResponse(BaseModel):
    id: int
    user_id: int
    title: str
    city: str
    target_date: Optional[str]
    total_hours: float
    total_budget_inr: int
    transport_mode: str
    city_mode: str
    summary: Optional[str]
    total_estimated_cost: int
    responsible_travel_score: float
    created_at: datetime
    items: List[dict] = []

    model_config = ConfigDict(from_attributes=True)
