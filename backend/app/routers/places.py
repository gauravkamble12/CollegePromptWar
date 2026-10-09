from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.place import Place
from backend.app.schemas.place import PlaceResponse, PlaceDetailResponse
from backend.app.services.trust_engine import evaluate_place_trust, calculate_completeness_score
from backend.app.services.itinerary_solver import haversine_km, estimate_travel_time_min

router = APIRouter(prefix="/places", tags=["Places & Discovery"])

def enrich_place_response(p: Place, user_lat: Optional[float] = None, user_lng: Optional[float] = None, city_mode: str = "tourist") -> PlaceResponse:
    trust = evaluate_place_trust(p)
    _, missing = calculate_completeness_score(p)

    dist = None
    travel_time = None
    if user_lat is not None and user_lng is not None:
        dist = round(haversine_km(user_lat, user_lng, p.latitude, p.longitude), 2)
        travel_time = estimate_travel_time_min(dist, "walking")

    # Mode-aware why_recommended
    why_recommended = f"Rated {p.rating} ★ with verified {p.verification_tier.value} backing."
    if city_mode == "student":
        why_recommended = f"Budget-friendly (₹{p.estimated_cost_inr}) with strong local popularity."
    elif city_mode == "accessibility":
        if p.is_wheelchair_accessible == 1:
            why_recommended = "Verified step-free access and accessible facilities."
        else:
            why_recommended = "Limited wheelchair accessibility recorded."
    elif city_mode == "history":
        why_recommended = f"High historical score ({p.historical_significance_score}/100) and cultural importance."
    elif city_mode == "rainy":
        if p.category in ["museum", "cafe", "restaurant", "hospital"]:
            why_recommended = "Sheltered indoor environment suitable for adverse weather."

    resp_dict = {
        "id": p.id,
        "name": p.name,
        "category": p.category,
        "description": p.description,
        "address": p.address,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "verification_tier": p.verification_tier,
        "source_attribution": p.source_attribution,
        "source_url": p.source_url,
        "rating": p.rating,
        "review_count": p.review_count,
        "estimated_cost_inr": p.estimated_cost_inr,
        "price_level": p.price_level,
        "opening_hours": p.opening_hours,
        "is_wheelchair_accessible": p.is_wheelchair_accessible,
        "has_restrooms": p.has_restrooms,
        "has_parking": p.has_parking,
        "family_friendly": p.family_friendly,
        "public_transit_access": p.public_transit_access,
        "cleanliness_score": p.cleanliness_score,
        "safety_rating": p.safety_rating,
        "connectivity_score": p.connectivity_score,
        "historical_significance_score": p.historical_significance_score,
        "affordability_score": p.affordability_score,
        "photos": p.photos,
        "knowledge_tags": p.knowledge_tags,
        "related_place_ids": p.related_place_ids,
        "last_verified_at": p.last_verified_at,
        "created_at": p.created_at,
        "trust_indicator": trust,
        "distance_km": dist,
        "travel_time_min": travel_time,
        "why_recommended": why_recommended,
        "missing_information": missing
    }
    return PlaceResponse(**resp_dict)

@router.get("", response_model=List[PlaceResponse])
def get_places(
    category: Optional[str] = None,
    max_budget_inr: Optional[int] = None,
    min_rating: Optional[float] = None,
    wheelchair_only: Optional[bool] = False,
    family_only: Optional[bool] = False,
    search: Optional[str] = None,
    user_lat: Optional[float] = Query(default=None),
    user_lng: Optional[float] = Query(default=None),
    city_mode: Optional[str] = "tourist",
    db: Session = Depends(get_db)
):
    query = db.query(Place)

    if category and category.lower() != "all":
        query = query.filter(Place.category == category.lower())

    if max_budget_inr is not None:
        query = query.filter(Place.estimated_cost_inr <= max_budget_inr)

    if min_rating is not None:
        query = query.filter(Place.rating >= min_rating)

    if wheelchair_only:
        query = query.filter(Place.is_wheelchair_accessible == 1)

    if family_only:
        query = query.filter(Place.family_friendly == 1)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            Place.name.ilike(search_filter) |
            Place.description.ilike(search_filter) |
            Place.address.ilike(search_filter)
        )

    places = query.all()

    # Dynamic Persona / City Mode sorting
    if city_mode == "student":
        places.sort(key=lambda p: (p.affordability_score, p.rating), reverse=True)
    elif city_mode == "accessibility":
        places.sort(key=lambda p: (p.is_wheelchair_accessible, p.rating), reverse=True)
    elif city_mode == "history":
        places.sort(key=lambda p: (p.historical_significance_score, p.rating), reverse=True)
    else:
        places.sort(key=lambda p: p.rating, reverse=True)

    return [enrich_place_response(p, user_lat, user_lng, city_mode) for p in places]

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(Place.category).distinct().all()
    categories = [r[0] for r in rows]
    return {"categories": ["all"] + sorted(categories)}

@router.get("/{place_id}", response_model=PlaceDetailResponse)
def get_place_detail(
    place_id: int,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    db: Session = Depends(get_db)
):
    p = db.query(Place).filter(Place.id == place_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Place not found")

    base_resp = enrich_place_response(p, user_lat, user_lng)

    # Fetch related places
    related = []
    if p.related_place_ids:
        rel_places = db.query(Place).filter(Place.id.in_(p.related_place_ids)).all()
        related = [enrich_place_response(rp, user_lat, user_lng) for rp in rel_places]

    return PlaceDetailResponse(
        **base_resp.model_dump(),
        reviews=[],
        related_places=related
    )
