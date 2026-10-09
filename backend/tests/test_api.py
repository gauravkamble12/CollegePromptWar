import pytest
from backend.app.services.trust_engine import calculate_freshness_score, calculate_corroboration_score
from backend.app.models.place import Place, VerificationTier
from datetime import datetime, timezone, timedelta

def test_health_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["places_indexed"] >= 10

def test_auth_registration_and_login(client):
    # 1. Register new user
    reg_payload = {
        "email": "freshuser@citylife.org",
        "username": "freshuser",
        "password": "strongPassword123!",
        "full_name": "Fresh Explorer"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "freshuser@citylife.org"

    # 2. Login
    login_payload = {
        "email_or_username": "freshuser",
        "password": "strongPassword123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

def test_places_discovery_and_trust(client):
    res = client.get("/api/v1/places?category=historical")
    assert res.status_code == 200
    places = res.json()
    assert len(places) >= 1
    p = places[0]
    assert "trust_indicator" in p
    assert p["trust_indicator"]["composite_score"] > 0
    assert "source_attribution" in p

def test_route_comparison(client):
    res = client.get("/api/v1/map/routes?start_lat=18.5196&start_lng=73.8553&end_lat=18.5236&end_lng=73.8415&mode=walking")
    assert res.status_code == 200
    data = res.json()
    assert len(data["routes"]) >= 2
    assert "recommended_route_id" in data
    assert "safety_disclaimer" in data

def test_itinerary_constraint_generator(client):
    req = {
        "city": "Pune",
        "total_hours": 6.0,
        "total_budget_inr": 800,
        "transport_mode": "walking",
        "city_mode": "tourist"
    }
    res = client.post("/api/v1/itineraries/generate", json=req)
    assert res.status_code == 200
    data = res.json()
    assert len(data["stops"]) >= 2
    assert data["total_estimated_cost"] <= 800
    assert data["responsible_travel_score"] >= 80

def test_place_comparison_engine(client):
    req = {
        "place_ids": [1, 2, 3],
        "weights": {
            "affordability": 0.3,
            "cleanliness": 0.2,
            "accessibility": 0.2,
            "ratings": 0.2,
            "connectivity": 0.1,
            "historical_significance": 0.0
        }
    }
    res = client.post("/api/v1/comparison", json=req)
    assert res.status_code == 200
    data = res.json()
    assert len(data["places"]) == 3
    assert data["top_recommended_place_id"] in [1, 2, 3]

def test_ai_assistant_grounded_query(client):
    req = {
        "query": "Plan a one-day Pune trip under ₹1,000 for historical places"
    }
    res = client.post("/api/v1/assistant/query", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["intent_detected"] in ["heritage_exploration", "itinerary_planning"]
    assert len(data["grounded_citations"]) >= 1
    assert data["confidence_score"] > 80

def test_citizen_report_submission_and_spam(client):
    # Valid report
    valid_rep = {
        "category": "road_damage",
        "title": "Serious deep pothole on Fergusson College Road",
        "description": "Hazardous road condition near the signal obstructing scooter traffic.",
        "latitude": 18.5230,
        "longitude": 73.8419,
        "severity_level": "high"
    }
    res = client.post("/api/v1/reports", json=valid_rep)
    assert res.status_code == 201

    # Spam report (repetitive character)
    spam_rep = {
        "category": "road_damage",
        "title": "aaaaaa aaaaaa aaaaaa",
        "description": "bbbbbb bbbbbb bbbbbb",
        "latitude": 18.5230,
        "longitude": 73.8419
    }
    spam_res = client.post("/api/v1/reports", json=spam_rep)
    assert spam_res.status_code == 400

def test_city_pulse_telemetry(client):
    res = client.get("/api/v1/pulse")
    assert res.status_code == 200
    data = res.json()
    assert "current_temperature_c" in data
    assert "providers" in data


def test_registration_cannot_escalate_role(client):
    """Clients must never be able to self-assign a privileged role."""
    res = client.post("/api/v1/auth/register", json={
        "email": "climber@citylife.org",
        "username": "climber",
        "password": "strongPassword123!",
        "full_name": "Climber",
        "role": "admin",
    })
    assert res.status_code == 201
    assert res.json()["user"]["role"] == "user"


def test_moderation_endpoint_requires_role(client):
    reports = client.get("/api/v1/reports").json()
    report_id = reports[0]["id"] if reports else 1
    payload = {"new_status": "verified"}

    # Anonymous callers are rejected.
    anon = client.patch(f"/api/v1/reports/{report_id}/moderate", json=payload)
    assert anon.status_code == 401

    # Authenticated but non-privileged users are forbidden.
    reg = client.post("/api/v1/auth/register", json={
        "email": "plainuser@citylife.org",
        "username": "plainuser",
        "password": "strongPassword123!",
    })
    token = reg.json()["access_token"]
    forbidden = client.patch(
        f"/api/v1/reports/{report_id}/moderate",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert forbidden.status_code == 403


def test_osm_adapter_extracts_photos():
    from backend.app.adapters.osm_adapter import _extract_photos

    photos = _extract_photos({
        "image": "https://example.org/photo.jpg",
        "wikimedia_commons": "File:Shaniwar Wada.jpg",
    })
    assert "https://example.org/photo.jpg" in photos
    assert any("Special:FilePath/Shaniwar_Wada.jpg" in p for p in photos)
    assert _extract_photos({}) == []

