from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from backend.app.models.report import ReportCategory, ReportStatus

class CivicReportBase(BaseModel):
    category: ReportCategory
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    latitude: float
    longitude: float
    address_reference: Optional[str] = None
    severity_level: Optional[str] = "medium"

class CivicReportCreate(CivicReportBase):
    photo_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    voice_transcript: Optional[str] = None

class ModerationActionRequest(BaseModel):
    new_status: ReportStatus
    moderator_note: Optional[str] = None
    is_duplicate_of_id: Optional[int] = None

class ModerationLogResponse(BaseModel):
    id: int
    moderator_id: Optional[int]
    previous_status: str
    new_status: str
    moderator_note: Optional[str]
    action_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class CivicReportResponse(CivicReportBase):
    id: int
    reporter_id: Optional[int]
    status: ReportStatus
    photo_url: Optional[str]
    voice_note_url: Optional[str]
    voice_transcript: Optional[str]
    ai_vision_tags: List[str] = []
    corroboration_count: int = 1
    is_duplicate_of_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    moderation_logs: List[ModerationLogResponse] = []

    model_config = ConfigDict(from_attributes=True)
