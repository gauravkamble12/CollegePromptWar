from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class ComparisonWeights(BaseModel):
    affordability: float = Field(default=0.2, ge=0, le=1)
    cleanliness: float = Field(default=0.2, ge=0, le=1)
    accessibility: float = Field(default=0.2, ge=0, le=1)
    ratings: float = Field(default=0.2, ge=0, le=1)
    connectivity: float = Field(default=0.2, ge=0, le=1)
    historical_significance: float = Field(default=0.0, ge=0, le=1)

class ComparisonRequest(BaseModel):
    place_ids: List[int] = Field(..., min_length=2, max_length=5)
    weights: Optional[ComparisonWeights] = None
    highlight_dimensions: Optional[List[str]] = None

class DimensionScore(BaseModel):
    dimension: str
    raw_value: float
    normalized_score: float # 0 to 100
    weighted_score: float
    label: str

class ComparisonPlaceResult(BaseModel):
    place_id: int
    name: str
    category: str
    composite_score: float # 0 to 100
    safety_observation_rating: float # kept clearly labeled and un-merged with popularity
    dimension_scores: Dict[str, DimensionScore]
    pros: List[str]
    cons: List[str]
    best_for_persona: str # e.g. "Best for Budget Travelers" or "Best for Wheelchair Accessibility"
    data_freshness_warning: Optional[str] = None

class ComparisonResponse(BaseModel):
    places: List[ComparisonPlaceResult]
    top_recommended_place_id: int
    rationale: str
    disclaimer: str = "Scores are calculated from normalized multi-factor criteria. Safety observations are evaluated separately and do not imply an absolute guarantee of safety."
