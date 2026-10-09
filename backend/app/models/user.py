from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class RoleEnum(str, enum.Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.USER, nullable=False)
    is_active = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reports = relationship("CivicReport", back_populates="reporter")
    itineraries = relationship("SavedItinerary", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    default_city_mode = Column(String(50), default="tourist")  # tourist, student, family, accessibility, history, food, commuter, rainy
    preferred_transport = Column(String(50), default="walking")  # walking, driving, transit, bicycling
    budget_level = Column(String(20), default="moderate")  # budget, moderate, luxury
    accessibility_required = Column(Integer, default=0)
    dietary_preferences = Column(JSON, default=list)  # e.g. ["vegetarian", "street_food"]
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="preferences")
