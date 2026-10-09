from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class ReportCategory(str, enum.Enum):
    ROAD_DAMAGE = "road_damage"
    WATERLOGGING = "waterlogging"
    BROKEN_STREETLIGHTS = "broken_streetlights"
    ACCESSIBILITY_OBSTACLE = "accessibility_obstacle"
    WASTE_ACCUMULATION = "waste_accumulation"
    TRAFFIC_DISRUPTION = "traffic_disruption"
    PUBLIC_HAZARD = "public_hazard"
    TEMPORARY_CLOSURE = "temporary_closure"
    INCORRECT_INFO = "incorrect_info"

class ReportStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    PENDING_REVIEW = "pending_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    NEEDS_MORE_INFO = "needs_more_info"
    RESOLVED = "resolved"

class CivicReport(Base):
    __tablename__ = "civic_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True) # Anonymous allowed
    category = Column(Enum(ReportCategory), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, index=True, nullable=False)
    longitude = Column(Float, index=True, nullable=False)
    address_reference = Column(String(300), nullable=True)
    
    status = Column(Enum(ReportStatus), default=ReportStatus.SUBMITTED, nullable=False, index=True)
    severity_level = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Media paths (sanitized of EXIF data)
    photo_url = Column(String(500), nullable=True)
    voice_note_url = Column(String(500), nullable=True)
    voice_transcript = Column(Text, nullable=True)
    ai_vision_tags = Column(JSON, default=list)  # Suggested tags e.g. ["pothole", "asphalt", "water"]

    # Deduplication & Corroboration
    corroboration_count = Column(Integer, default=1)
    is_duplicate_of_id = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    reporter = relationship("User", back_populates="reports")
    moderation_logs = relationship("ModerationLog", back_populates="report", cascade="all, delete-orphan")

class ModerationLog(Base):
    __tablename__ = "moderation_logs"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("civic_reports.id", ondelete="CASCADE"), nullable=False)
    moderator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    moderator_note = Column(Text, nullable=True)
    action_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    report = relationship("CivicReport", back_populates="moderation_logs")
