from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from backend.app.models.place import VerificationTier

class TrustScoreBreakdown(BaseModel):
    composite_score: float = Field(..., ge=0, le=100, description="Composite trust rating out of 100")
    source_score: float = Field(..., ge=0, le=100)
    freshness_score: float = Field(..., ge=0, le=100)
    corroboration_score: float = Field(..., ge=0, le=100)
    completeness_score: float = Field(..., ge=0, le=100)
    verification_tier: VerificationTier
    is_stale: bool = False
    has_uncertainty_warning: bool = False
    uncertainty_reasons: List[str] = []
    explanation: str

class PlaceBase(BaseModel):
    name: str
    category: str
    description: str
    address: str
    latitude: float
    longitude: float
    verification_tier: VerificationTier = VerificationTier.VERIFIED_BUSINESS
    source_attribution: str
    source_url: Optional[str] = None
    rating: float = 4.0
    review_count: int = 1
    estimated_cost_inr: int = 0
    price_level: int = 1
    opening_hours: Dict[str, Any] = {}
    is_wheelchair_accessible: int = 0
    has_restrooms: int = 1
    has_parking: int = 0
    family_friendly: int = 1
    public_transit_access: Optional[str] = None
    cleanliness_score: float = 75.0
    safety_rating: float = 80.0
    connectivity_score: float = 70.0
    historical_significance_score: float = 50.0
    affordability_score: float = 80.0
    photos: List[str] = []
    knowledge_tags: List[str] = []
    related_place_ids: List[int] = []

class PlaceCreate(PlaceBase):
    pass

class PlaceResponse(PlaceBase):
    id: int
    last_verified_at: datetime
    created_at: datetime
    trust_indicator: Optional[TrustScoreBreakdown] = None
    distance_km: Optional[float] = None
    travel_time_min: Optional[int] = None
    why_recommended: Optional[str] = None
    missing_information: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class PlaceDetailResponse(PlaceResponse):
    reviews: List[Dict[str, Any]] = []
    related_places: List[PlaceResponse] = []

class PlaceFilterQuery(BaseModel):
    category: Optional[str] = None
    max_distance_km: Optional[float] = None
    max_budget_inr: Optional[int] = None
    min_rating: Optional[float] = None
    wheelchair_only: Optional[bool] = False
    family_only: Optional[bool] = False
    search: Optional[str] = None
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    city_mode: Optional[str] = "tourist"
