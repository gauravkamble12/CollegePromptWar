import io
import pytest
from datetime import datetime, timezone, timedelta
from PIL import Image
from backend.app.security.exif import sanitize_and_save_image
from backend.app.services.trust_engine import calculate_freshness_score, calculate_corroboration_score, calculate_completeness_score
from backend.app.models.place import Place, VerificationTier
from backend.app.config import settings

def test_exif_sanitization():
    # Create synthetic image with raw EXIF header simulation
    img = Image.new("RGB", (100, 100), color=(255, 0, 0))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    raw_bytes = buffer.getvalue()

    saved_url = sanitize_and_save_image(raw_bytes, "test_upload.jpg", settings.UPLOAD_DIR)
    assert saved_url.startswith("/uploads/")
    assert saved_url.endswith(".jpg")

def test_freshness_decay_over_time():
    now = datetime.now(timezone.utc)
    
    # Fresh item (today)
    fresh_score, is_stale = calculate_freshness_score(now)
    assert fresh_score >= 99.0
    assert not is_stale

    # 45 days old
    mid_score, mid_stale = calculate_freshness_score(now - timedelta(days=45))
    assert 50.0 < mid_score < 90.0
    assert not mid_stale

    # 120 days old -> marked stale
    old_score, old_stale = calculate_freshness_score(now - timedelta(days=120))
    assert old_stale is True
    assert old_score < 50.0

def test_completeness_checker():
    p_complete = Place(
        name="Complete Hub",
        category="museum",
        description="A full detailed description of the museum over thirty characters long.",
        address="Central street",
        latitude=18.5,
        longitude=73.8,
        source_attribution="Official",
        opening_hours={"open": "09:00", "close": "18:00"},
        photos=["https://example.com/photo.jpg"],
        estimated_cost_inr=50,
        price_level=1,
        is_wheelchair_accessible=1,
        public_transit_access="Metro Station Line 1"
    )
    comp_score, missing = calculate_completeness_score(p_complete)
    assert comp_score == 100.0
    assert len(missing) == 0

    p_sparse = Place(
        name="Sparse",
        category="cafe",
        description="Brief",
        address="Alley",
        latitude=18.5,
        longitude=73.8,
        source_attribution="Unknown",
        opening_hours={},
        photos=[],
        estimated_cost_inr=0,
        price_level=0,
        is_wheelchair_accessible=0,
        public_transit_access=None
    )
    sparse_score, sparse_missing = calculate_completeness_score(p_sparse)
    assert sparse_score < 50.0
    assert "Operating hours" in sparse_missing
    assert "Verified photographs" in sparse_missing
