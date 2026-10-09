from datetime import datetime, timezone
import math
from typing import List, Optional
from backend.app.models.report import CivicReport

def haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0 # meters
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def detect_potential_duplicate(
    new_report_cat: str,
    new_lat: float,
    new_lng: float,
    existing_reports: List[CivicReport],
    max_distance_meters: float = 120.0
) -> Optional[CivicReport]:
    """
    Checks if a recent active report of the same category exists within spatial threshold.
    """
    for r in existing_reports:
        if r.category.value == new_report_cat:
            dist = haversine_meters(new_lat, new_lng, r.latitude, r.longitude)
            if dist <= max_distance_meters:
                return r
    return None

def analyze_spam_indicators(title: str, description: str) -> bool:
    """
    Flags trivial spam, repetitive characters, or extreme short texts.
    """
    text = (title + " " + description).strip()
    if len(text) < 15:
        return True
    # Character repetition check (e.g. "aaaaa" or "!!!!!!!!!")
    if any(char * 6 in text for char in "abcdefghijklmnopqrstuvwxyz!?. "):
        return True
    return False
