from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class VerificationTier(str, enum.Enum):
    OFFICIAL = "official"                    # Municipal, official gov, authoritative
    VERIFIED_BUSINESS = "verified_business"  # Directly verified business entry
    COMMUNITY = "community"                  # Crowdsourced / community observation
    AI_INTERPRETATION = "ai_interpretation"  # Summarized from collected evidence

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # historical, restaurant, attraction, transit, hospital, cafe, park, etc.
    description = Column(Text, nullable=False)
    address = Column(String(300), nullable=False)
    latitude = Column(Float, index=True, nullable=False)
    longitude = Column(Float, index=True, nullable=False)

    # Trust & Verification
    verification_tier = Column(Enum(VerificationTier), default=VerificationTier.VERIFIED_BUSINESS, nullable=False)
    source_attribution = Column(String(255), nullable=False)
    source_url = Column(String(500), nullable=True)
    last_verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    confidence_notes = Column(Text, nullable=True)

    # Practical attributes
    rating = Column(Float, default=4.0)
    review_count = Column(Integer, default=1)
    estimated_cost_inr = Column(Integer, default=0)  # in INR e.g. 50, 200, 800
    price_level = Column(Integer, default=1)        # 1: Budget, 2: Moderate, 3: Premium, 4: Luxury
    opening_hours = Column(JSON, default=dict)      # {"open": "09:00", "close": "18:00", "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
    
    # Facilities & Accessibility
    is_wheelchair_accessible = Column(Integer, default=0) # 0: Unknown/No, 1: Yes, -1: Inaccessible
    has_restrooms = Column(Integer, default=1)
    has_parking = Column(Integer, default=0)
    family_friendly = Column(Integer, default=1)
    public_transit_access = Column(String(100), nullable=True)

    # Multidimensional Comparison Metrics (0 - 100 normalized)
    cleanliness_score = Column(Float, default=75.0)
    safety_rating = Column(Float, default=80.0)
    connectivity_score = Column(Float, default=70.0)
    historical_significance_score = Column(Float, default=50.0)
    affordability_score = Column(Float, default=80.0)

    # Rich Media & Knowledge Graph
    photos = Column(JSON, default=list)             # List of photo URLs
    knowledge_tags = Column(JSON, default=list)     # ["Maratha Empire", "Peshwa Architecture", "Misal Pav"]
    related_place_ids = Column(JSON, default=list)  # IDs of linked places in knowledge graph

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    reviews = relationship("Review", back_populates="place", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("places.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=False)
    cleanliness_rating = Column(Float, nullable=True)
    accessibility_rating = Column(Float, nullable=True)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    place = relationship("Place", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
