from typing import List, Dict, Any

PUNE_KNOWLEDGE_NODES = [
    {
        "id": "maratha_empire",
        "name": "Maratha Empire & Peshwa Era (1674–1818)",
        "type": "historical_era",
        "description": "Rich historical period shaping Pune as the seat of the Peshwas and fortress city.",
        "linked_places": [1, 2, 7], # Shaniwar Wada, Lal Mahal, Sinhagad Fort
        "cultural_insights": ["Wada Architecture", "Shivaji Maharaj legacy", "Traditional brass & copper craft"]
    },
    {
        "id": "pune_culinary_tradition",
        "name": "Maharashtrian Gastronomic Heritage",
        "type": "tradition",
        "description": "Culinary culture spanning spicy Puneri Misal, Pithla Bhakri, and iconic Chitale Bakarwadi.",
        "linked_places": [3, 4, 8], # Vaishali, Kata Kirr, Bedekar Tea Stall
        "cultural_insights": ["Authentic spices", "Generations-old eateries", "College cafe culture on FC Road"]
    },
    {
        "id": "swargate_transit_hub",
        "name": "Swargate Inter-city & Metro Node",
        "type": "transport_hub",
        "description": "Major multimodal transit nexus linking state buses, metro line 1, and city routes.",
        "linked_places": [1, 3, 5],
        "cultural_insights": ["Key transit interchange for southern Pune"]
    }
]

def get_knowledge_graph_data() -> Dict[str, Any]:
    return {
        "nodes": PUNE_KNOWLEDGE_NODES,
        "total_nodes": len(PUNE_KNOWLEDGE_NODES),
        "source": "Maharashtra Directorate of Archaeology and Curated Pune Municipal Archives"
    }
