from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class SavedItinerary(Base):
    __tablename__ = "saved_itineraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    city = Column(String(100), default="Pune")
    target_date = Column(String(50), nullable=True)
    total_hours = Column(Float, default=8.0)
    total_budget_inr = Column(Integer, default=1000)
    transport_mode = Column(String(50), default="walking") # walking, transit, driving
    city_mode = Column(String(50), default="tourist")
    summary = Column(Text, nullable=True)
    total_estimated_cost = Column(Integer, default=0)
    responsible_travel_score = Column(Float, default=85.0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="itineraries")
    items = relationship("ItineraryItem", back_populates="itinerary", cascade="all, delete-orphan", order_by="ItineraryItem.order_index")

class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("saved_itineraries.id", ondelete="CASCADE"), nullable=False)
    place_id = Column(Integer, ForeignKey("places.id", ondelete="SET NULL"), nullable=True)
    order_index = Column(Integer, nullable=False)
    custom_name = Column(String(200), nullable=True)
    suggested_arrival = Column(String(20), nullable=True)   # "10:00 AM"
    duration_minutes = Column(Integer, default=60)
    travel_time_from_previous_min = Column(Integer, default=15)
    cost_inr = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    data_freshness_warning = Column(String(200), nullable=True)

    itinerary = relationship("SavedItinerary", back_populates="items")
