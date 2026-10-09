from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class GroundedSourceCitation(BaseModel):
    title: str
    source_attribution: str
    confidence_level: str # "high", "moderate", "limited"
    data_timestamp: str

class AIAssistantQuery(BaseModel):
    query: str
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    city_mode: Optional[str] = "tourist"
    budget_inr: Optional[int] = None
    max_time_hours: Optional[float] = None
    require_wheelchair: Optional[bool] = False

class AIAssistantResponse(BaseModel):
    query: str
    answer: str
    intent_detected: str
    grounded_citations: List[GroundedSourceCitation] = []
    recommended_places: List[Dict[str, Any]] = []
    caution_notes: List[str] = []
    confidence_score: float
    is_sufficient_evidence: bool = True
