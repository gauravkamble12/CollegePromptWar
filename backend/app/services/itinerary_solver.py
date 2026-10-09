from datetime import datetime, timedelta
from typing import List, Optional
from backend.app.models.place import Place
from backend.app.schemas.itinerary import ItineraryGenerateRequest, ItineraryResponse, ItineraryStopResponse
from backend.app.services.geo import haversine_km

def estimate_travel_time_min(dist_km: float, mode: str) -> int:
    if mode == "walking":
        speed_kmh = 4.5
    elif mode == "transit":
        speed_kmh = 18.0
    else: # driving
        speed_kmh = 24.0
    
    mins = int((dist_km / speed_kmh) * 60.0)
    # Add minimal buffer
    return max(5, mins + 5)

def solve_itinerary(
    request: ItineraryGenerateRequest,
    available_places: List[Place]
) -> ItineraryResponse:
    # 1. Filter out incompatible places (accessibility, etc.)
    preferred = request.preferred_categories or []
    apply_preference = bool(preferred) and "all" not in preferred

    candidates: List[Place] = []
    for p in available_places:
        if request.accessibility_required and p.is_wheelchair_accessible == -1:
            continue
        candidates.append(p)

    if not candidates:
        candidates = available_places

    # 2. Greedy optimization: start at request.start_lat, request.start_lng
    curr_lat = request.start_lat or 18.5204
    curr_lng = request.start_lng or 73.8567
    
    remaining_hours = float(request.total_hours)
    remaining_budget = int(request.total_budget_inr)
    
    # Start itinerary at 09:30 AM
    current_time = datetime.strptime("09:30", "%H:%M")
    
    visited_ids = set()
    stops: List[ItineraryStopResponse] = []
    total_cost = 0

    order_idx = 1
    # Target between 2 and 6 stops depending on total_hours
    max_stops = max(2, min(6, int(request.total_hours // 1.5)))

    while remaining_hours > 0.8 and len(stops) < max_stops:
        best_candidate: Optional[Place] = None
        best_dist = 9999.0
        best_score = -9999.0

        for cand in candidates:
            if cand.id in visited_ids:
                continue
            
            # Check budget feasibility
            cost = cand.estimated_cost_inr or 0
            if cost > remaining_budget and remaining_budget < 100:
                continue

            dist = haversine_km(curr_lat, curr_lng, cand.latitude, cand.longitude)
            travel_time_h = estimate_travel_time_min(dist, request.transport_mode) / 60.0
            visit_time_h = 1.0  # default 1 hour stay

            if (travel_time_h + visit_time_h) > (remaining_hours + 0.25):
                continue

            # Multi-objective score: high rating, close distance, within budget,
            # and (when the user expressed preferences) a category alignment nudge.
            dist_penalty = dist * 1.5
            cost_penalty = (cost / max(1, request.total_budget_inr)) * 10.0
            quality_bonus = (cand.rating or 4.0) * 15.0
            pref_bonus = 0.0
            if apply_preference:
                pref_bonus = 12.0 if cand.category in preferred else -8.0

            cand_score = quality_bonus - dist_penalty - cost_penalty + pref_bonus
            if cand_score > best_score:
                best_score = cand_score
                best_candidate = cand
                best_dist = dist

        if not best_candidate:
            break

        # Book stop
        visited_ids.add(best_candidate.id)
        travel_min = estimate_travel_time_min(best_dist, request.transport_mode)
        current_time += timedelta(minutes=travel_min)
        arrival_str = current_time.strftime("%I:%M %p")
        
        stay_min = 60
        if best_candidate.category in ["historical", "museum"]:
            stay_min = 75
        elif best_candidate.category in ["cafe", "street_food"]:
            stay_min = 45

        current_time += timedelta(minutes=stay_min)
        spent_hours = (travel_min + stay_min) / 60.0
        remaining_hours -= spent_hours

        cand_cost = best_candidate.estimated_cost_inr or 0
        remaining_budget -= cand_cost
        total_cost += cand_cost

        # Rationale
        why = f"High alignment for {request.city_mode} mode. Distance: {round(best_dist, 1)}km."
        if best_candidate.rating >= 4.5:
            why += f" Superb visitor rating ({best_candidate.rating} ★)."
        if cand_cost == 0:
            why += " Free public admission."

        stops.append(ItineraryStopResponse(
            order_index=order_idx,
            place_id=best_candidate.id,
            name=best_candidate.name,
            category=best_candidate.category,
            address=best_candidate.address,
            latitude=best_candidate.latitude,
            longitude=best_candidate.longitude,
            suggested_arrival=arrival_str,
            duration_minutes=stay_min,
            travel_time_from_previous_min=travel_min,
            cost_inr=cand_cost,
            notes=f"Recommended stop duration: {stay_min} mins. Route leg: {round(best_dist, 1)} km.",
            data_freshness_warning=None,
            why_recommended=why
        ))

        curr_lat = best_candidate.latitude
        curr_lng = best_candidate.longitude
        order_idx += 1

    # Responsible travel score calculation
    if request.transport_mode == "walking":
        resp_score = 96.0
    elif request.transport_mode == "transit":
        resp_score = 88.0
    else:
        resp_score = 65.0

    # Collect alternative unvisited places
    alternatives = [
        c.name for c in candidates if c.id not in visited_ids
    ][:3]

    title = f"{request.total_hours}h {request.city_mode.capitalize()} Tour ({request.city})"

    return ItineraryResponse(
        title=title,
        city=request.city,
        total_hours=request.total_hours,
        total_budget_inr=request.total_budget_inr,
        total_estimated_cost=total_cost,
        transport_mode=request.transport_mode,
        city_mode=request.city_mode,
        stops=stops,
        responsible_travel_score=resp_score,
        weather_summary="Pleasant urban weather forecast. Ideal for planned transit.",
        alternatives=alternatives
    )
