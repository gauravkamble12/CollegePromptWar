from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.place import Place
from backend.app.schemas.ai import AIAssistantQuery, AIAssistantResponse
from backend.app.services.ai_assistant import process_ai_query

router = APIRouter(prefix="/assistant", tags=["AI City Assistant"])

@router.post("/query", response_model=AIAssistantResponse)
def query_ai_assistant(
    query_in: AIAssistantQuery,
    db: Session = Depends(get_db)
):
    places = db.query(Place).all()
    response = process_ai_query(query_in, places)
    return response
