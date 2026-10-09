"""
Synchronizes live OpenStreetMap places into the local database.

Upsert is idempotent: places already present (matched by their OSM source URL)
are skipped, so repeated syncs only add genuinely new points of interest.
"""
from typing import Any, Dict

from sqlalchemy.orm import Session

from backend.app.adapters.osm_adapter import OSM_URL_PREFIX, fetch_pune_places_sync
from backend.app.models.place import Place


def sync_osm_places(db: Session) -> Dict[str, Any]:
    fetched = fetch_pune_places_sync()
    if not fetched:
        return {"fetched": 0, "added": 0, "skipped": 0, "status": "no_data"}

    existing = {
        url
        for (url,) in db.query(Place.source_url)
        .filter(Place.source_url.like(f"{OSM_URL_PREFIX}%"))
        .all()
    }

    added = 0
    for item in fetched:
        if item["source_url"] in existing:
            continue
        db.add(Place(**item))
        existing.add(item["source_url"])
        added += 1

    if added:
        db.commit()

    return {
        "fetched": len(fetched),
        "added": added,
        "skipped": len(fetched) - added,
        "status": "ok",
    }
