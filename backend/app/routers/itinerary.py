from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.place import Place
from backend.app.models.user import User
from backend.app.models.itinerary import SavedItinerary, ItineraryItem
from backend.app.schemas.itinerary import ItineraryGenerateRequest, ItineraryResponse, SavedItineraryResponse
from backend.app.security.auth import get_current_user
from backend.app.services.itinerary_solver import solve_itinerary

router = APIRouter(prefix="/itineraries", tags=["Itinerary Planner"])

@router.post("/generate", response_model=ItineraryResponse)
def generate_itinerary(
    req: ItineraryGenerateRequest,
    db: Session = Depends(get_db)
):
    places = db.query(Place).all()
    itinerary = solve_itinerary(req, places)
    return itinerary

@router.post("/save", response_model=SavedItineraryResponse, status_code=status.HTTP_201_CREATED)
def save_itinerary(
    itinerary_data: ItineraryResponse,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = SavedItinerary(
        user_id=current_user.id,
        title=itinerary_data.title,
        city=itinerary_data.city,
        target_date="2026-10-15",
        total_hours=itinerary_data.total_hours,
        total_budget_inr=itinerary_data.total_budget_inr,
        transport_mode=itinerary_data.transport_mode,
        city_mode=itinerary_data.city_mode,
        summary=f"{len(itinerary_data.stops)} stops planned across {itinerary_data.city}.",
        total_estimated_cost=itinerary_data.total_estimated_cost,
        responsible_travel_score=itinerary_data.responsible_travel_score
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)

    for stop in itinerary_data.stops:
        item = ItineraryItem(
            itinerary_id=saved.id,
            place_id=stop.place_id,
            order_index=stop.order_index,
            custom_name=stop.name,
            suggested_arrival=stop.suggested_arrival,
            duration_minutes=stop.duration_minutes,
            travel_time_from_previous_min=stop.travel_time_from_previous_min,
            cost_inr=stop.cost_inr,
            notes=stop.notes,
            data_freshness_warning=stop.data_freshness_warning
        )
        db.add(item)
    db.commit()
    db.refresh(saved)

    # Serialize items
    items_list = [
        {
            "id": itm.id,
            "place_id": itm.place_id,
            "name": itm.custom_name,
            "suggested_arrival": itm.suggested_arrival,
            "duration_minutes": itm.duration_minutes,
            "cost_inr": itm.cost_inr,
            "notes": itm.notes
        }
        for itm in saved.items
    ]

    return SavedItineraryResponse(
        id=saved.id,
        user_id=saved.user_id,
        title=saved.title,
        city=saved.city,
        target_date=saved.target_date,
        total_hours=saved.total_hours,
        total_budget_inr=saved.total_budget_inr,
        transport_mode=saved.transport_mode,
        city_mode=saved.city_mode,
        summary=saved.summary,
        total_estimated_cost=saved.total_estimated_cost,
        responsible_travel_score=saved.responsible_travel_score,
        created_at=saved.created_at,
        items=items_list
    )

@router.get("/my", response_model=List[SavedItineraryResponse])
def get_my_itineraries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_list = db.query(SavedItinerary).filter(SavedItinerary.user_id == current_user.id).all()
    results = []
    for s in saved_list:
        items_list = [
            {
                "id": itm.id,
                "place_id": itm.place_id,
                "name": itm.custom_name,
                "suggested_arrival": itm.suggested_arrival,
                "duration_minutes": itm.duration_minutes,
                "cost_inr": itm.cost_inr,
                "notes": itm.notes
            }
            for itm in s.items
        ]
        results.append(SavedItineraryResponse(
            id=s.id,
            user_id=s.user_id,
            title=s.title,
            city=s.city,
            target_date=s.target_date,
            total_hours=s.total_hours,
            total_budget_inr=s.total_budget_inr,
            transport_mode=s.transport_mode,
            city_mode=s.city_mode,
            summary=s.summary,
            total_estimated_cost=s.total_estimated_cost,
            responsible_travel_score=s.responsible_travel_score,
            created_at=s.created_at,
            items=items_list
        ))
    return results

@router.delete("/{itinerary_id}")
def delete_itinerary(
    itinerary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(SavedItinerary).filter(
        SavedItinerary.id == itinerary_id,
        SavedItinerary.user_id == current_user.id
    ).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found.")
    
    db.delete(itinerary)
    db.commit()
    return {"message": "Itinerary deleted successfully."}
