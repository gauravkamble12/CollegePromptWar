from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.place import Place
from backend.app.schemas.comparison import ComparisonRequest, ComparisonResponse
from backend.app.services.comparison_engine import compare_places

router = APIRouter(prefix="/comparison", tags=["Best vs Worst Comparison"])

@router.post("", response_model=ComparisonResponse)
def run_place_comparison(
    req: ComparisonRequest,
    db: Session = Depends(get_db)
):
    places = db.query(Place).filter(Place.id.in_(req.place_ids)).all()
    if len(places) < 2:
        raise HTTPException(
            status_code=400,
            detail=f"At least two valid places must be provided for comparison. Found {len(places)}."
        )

    response = compare_places(places, req.weights)
    return response

@router.get("/default", response_model=ComparisonResponse)
def get_default_comparison(db: Session = Depends(get_db)):
    # Pick first 3 places as illustrative comparison
    places = db.query(Place).limit(3).all()
    return compare_places(places)
