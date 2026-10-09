from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.place import Place
from backend.app.models.report import CivicReport, ReportStatus
from backend.app.adapters.routing_adapter import compare_route_options

router = APIRouter(prefix="/map", tags=["Interactive Map & Routing"])

@router.get("/layers")
def get_map_layers(
    category: Optional[str] = None,
    include_incidents: bool = True,
    db: Session = Depends(get_db)
):
    # 1. Places pins
    p_query = db.query(Place)
    if category and category.lower() != "all":
        p_query = p_query.filter(Place.category == category.lower())
    places = p_query.all()

    place_markers = [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "rating": p.rating,
            "verification_tier": p.verification_tier.value,
            "is_wheelchair_accessible": p.is_wheelchair_accessible,
            "address": p.address
        }
        for p in places
    ]

    # 2. Incident & Hazard pins (from community & verified reports)
    incident_markers = []
    if include_incidents:
        reports = db.query(CivicReport).filter(CivicReport.status.in_([ReportStatus.SUBMITTED, ReportStatus.PENDING_REVIEW, ReportStatus.VERIFIED])).all()
        for r in reports:
            incident_markers.append({
                "id": r.id,
                "title": r.title,
                "category": r.category.value,
                "severity": r.severity_level,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "status": r.status.value,
                "corroboration_count": r.corroboration_count,
                "is_verified": r.status == ReportStatus.VERIFIED
            })

    return {
        "center": [18.5204, 73.8567],
        "default_zoom": 13,
        "places": place_markers,
        "incidents": incident_markers,
        "city": "Pune, India"
    }

@router.get("/routes")
def get_route_comparison(
    start_lat: float = Query(18.5196, description="Origin Latitude e.g. Shaniwar Wada"),
    start_lng: float = Query(73.8553, description="Origin Longitude"),
    end_lat: float = Query(18.5236, description="Destination Latitude e.g. FC Road"),
    end_lng: float = Query(73.8415, description="Destination Longitude"),
    mode: str = Query("walking", description="walking, transit, driving"),
    db: Session = Depends(get_db)
):
    # Check count of active verified incidents in the region
    hazard_count = db.query(CivicReport).filter(
        CivicReport.status == ReportStatus.VERIFIED,
        CivicReport.severity_level.in_(["high", "critical"])
    ).count()

    comparison = compare_route_options(start_lat, start_lng, end_lat, end_lng, mode, hazard_count)
    return comparison

@router.get("/emergency")
def get_emergency_services(db: Session = Depends(get_db)):
    emergency_places = db.query(Place).filter(Place.category.in_(["hospital", "transit"])).all()
    return {
        "emergency_contacts": [
            {"service": "Police Emergency", "number": "112 / 100"},
            {"service": "Ambulance / Medical Emergency", "number": "108 / 102"},
            {"service": "Fire Brigade", "number": "101"},
            {"service": "Pune Municipal Corporation Disaster Cell", "number": "020-25501269"},
            {"service": "Women Safety Helpline", "number": "1091"}
        ],
        "facilities": [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "address": p.address,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "public_transit_access": p.public_transit_access
            }
            for p in emergency_places
        ]
    }
