"""
Live OpenStreetMap place ingestion via the Overpass API.

Fetches real, current points of interest for Pune across all supported
categories and normalizes them into the shape consumed by the Place model.
All records are ODbL-licensed and attributed to OpenStreetMap contributors.
"""
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import httpx

from backend.app.models.place import VerificationTier

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

# Pune urban area bounding box: (south, west, north, east)
PUNE_BBOX = (18.38, 73.72, 18.65, 73.98)

# (category, osm tag filters, per-category result cap)
CATEGORY_QUERIES: List[Tuple[str, List[str], int]] = [
    ("historical", ["historic"], 60),
    ("museum", ["tourism=museum", "tourism=gallery"], 40),
    ("attraction", ["tourism=attraction", "tourism=viewpoint", "tourism=artwork"], 60),
    ("restaurant", ["amenity=restaurant"], 80),
    ("street_food", ["amenity=fast_food"], 60),
    ("cafe", ["amenity=cafe"], 60),
    ("park", ["leisure=park", "leisure=garden"], 50),
    ("shopping", ["shop=mall", "shop=department_store", "shop=supermarket", "shop=clothes"], 50),
    ("hospital", ["amenity=hospital", "amenity=clinic"], 40),
    ("transit", ["railway=station", "highway=bus_stop", "public_transport=station"], 50),
]

OSM_URL_PREFIX = "https://www.openstreetmap.org/"
USER_AGENT = "CityLife-SmartCityExplorer/1.0 (educational project; OSM ODbL attribution)"


def _build_query(tags: List[str], limit: int) -> str:
    south, west, north, east = PUNE_BBOX
    clauses = []
    for tag in tags:
        if "=" in tag:
            key, value = tag.split("=", 1)
            selector = f'["{key}"="{value}"]'
        else:
            selector = f'["{tag}"]'
        clauses.append(f"nwr{selector}({south},{west},{north},{east});")
    body = "\n  ".join(clauses)
    return f"[out:json][timeout:25];\n(\n  {body}\n);\nout center {limit};"


def _compose_address(tags: Dict[str, Any]) -> str:
    parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:suburb") or tags.get("addr:neighbourhood"),
        tags.get("addr:city") or "Pune",
    ]
    address = ", ".join(str(p).strip() for p in parts if p)
    if "Maharashtra" not in address:
        address = f"{address}, Maharashtra, India" if address else "Pune, Maharashtra, India"
    return address[:300]


def _compose_description(name: str, category: str, tags: Dict[str, Any]) -> str:
    details = []
    if tags.get("cuisine"):
        details.append(f"cuisine: {tags['cuisine']}")
    if tags.get("tourism"):
        details.append(f"tourism: {tags['tourism']}")
    if tags.get("historic"):
        details.append(f"historic ({tags['historic']})")
    if tags.get("shop"):
        details.append(f"shop: {tags['shop']}")
    if tags.get("amenity"):
        details.append(f"amenity: {tags['amenity']}")
    if tags.get("wikipedia"):
        details.append("Wikipedia-documented")
    if details:
        description = f"{name} ({category.replace('_', ' ')}) — " + ", ".join(details)
    else:
        description = f"{name} — a {category.replace('_', ' ')} point of interest in Pune."
    if len(description) < 30:
        description += " Sourced live from the OpenStreetMap community map."
    return description


def _map_wheelchair(tags: Dict[str, Any]) -> int:
    value = str(tags.get("wheelchair", "")).lower()
    if value in ("yes", "designated"):
        return 1
    if value == "no":
        return -1
    return 0


def _map_element(el: Dict[str, Any], category: str) -> Optional[Dict[str, Any]]:
    tags = el.get("tags", {})
    name = tags.get("name") or tags.get("name:en") or tags.get("name:mr")
    if not name:
        return None

    lat = el.get("lat")
    lon = el.get("lon")
    if lat is None or lon is None:
        center = el.get("center") or {}
        lat = center.get("lat")
        lon = center.get("lon")
    if lat is None or lon is None:
        return None

    el_type = el.get("type", "node")
    el_id = el.get("id")
    if el_id is None:
        return None

    knowledge_tags = [tags.get("historic"), tags.get("cuisine"), tags.get("tourism")]
    knowledge_tags = [t for t in knowledge_tags if t]
    knowledge_tags.append("OpenStreetMap (live)")

    return {
        "name": name[:200],
        "category": category,
        "description": _compose_description(name, category, tags),
        "address": _compose_address(tags),
        "latitude": float(lat),
        "longitude": float(lon),
        "verification_tier": VerificationTier.COMMUNITY,
        "source_attribution": "OpenStreetMap contributors (ODbL, live feed)",
        "source_url": f"{OSM_URL_PREFIX}{el.get('type', 'node')}/{el.get('id')}",
        "rating": 4.0,
        "review_count": 0,
        "estimated_cost_inr": 0,
        "price_level": 1,
        "opening_hours": {},
        "is_wheelchair_accessible": _map_wheelchair(tags),
        "has_restrooms": 0,
        "has_parking": 1 if tags.get("parking") else 0,
        "family_friendly": 1,
        "public_transit_access": tags.get("network") or None,
        "cleanliness_score": 70.0,
        "safety_rating": 70.0,
        "connectivity_score": 70.0,
        "historical_significance_score": 70.0 if category == "historical" else 40.0,
        "affordability_score": 70.0,
        "photos": [],
        "knowledge_tags": [t for t in knowledge_tags if t][:6],
        "related_place_ids": [],
        "confidence_notes": "Auto-ingested from OpenStreetMap Overpass API (community-mapped, unverified).",
    }


async def _fetch_category(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    category: str,
    tags: List[str],
    limit: int,
) -> List[Dict[str, Any]]:
    query = _build_query(tags, limit)
    async with semaphore:
        for endpoint in OVERPASS_ENDPOINTS:
            try:
                resp = await client.post(endpoint, data={"data": query}, timeout=30.0)
                if resp.status_code != 200:
                    continue
                payload = resp.json()
                results = []
                for element in payload.get("elements", []):
                    mapped = _map_element(element, category)
                    if mapped:
                        results.append(mapped)
                return results
            except Exception:
                continue
    return []


async def fetch_pune_places() -> List[Dict[str, Any]]:
    """Fetch live Pune POIs across all categories, de-duplicated by OSM URL."""
    semaphore = asyncio.Semaphore(3)
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    async with httpx.AsyncClient(headers=headers, timeout=35.0) as client:
        tasks = [
            _fetch_category(client, semaphore, category, tags, limit)
            for category, tags, limit in CATEGORY_QUERIES
        ]
        grouped = await asyncio.gather(*tasks)

    seen = set()
    merged: List[Dict[str, Any]] = []
    for group in grouped:
        for item in group:
            url = item["source_url"]
            if url in seen:
                continue
            seen.add(url)
            merged.append(item)
    return merged


def fetch_pune_places_sync() -> List[Dict[str, Any]]:
    """Synchronous bridge for use from FastAPI sync endpoints / worker threads."""
    return asyncio.run(fetch_pune_places())
