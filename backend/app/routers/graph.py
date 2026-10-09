from fastapi import APIRouter
from backend.app.services.city_graph import get_knowledge_graph_data

router = APIRouter(prefix="/knowledge-graph", tags=["City Knowledge Graph"])

@router.get("")
def get_graph():
    return get_knowledge_graph_data()
