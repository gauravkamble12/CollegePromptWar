from datetime import datetime, timezone
import math
from typing import Dict, Any, List
from backend.app.models.place import Place, VerificationTier
from backend.app.schemas.place import TrustScoreBreakdown

SOURCE_TIER_SCORES = {
    VerificationTier.OFFICIAL: 100.0,
    VerificationTier.VERIFIED_BUSINESS: 85.0,
    VerificationTier.AI_INTERPRETATION: 65.0,
    VerificationTier.COMMUNITY: 50.0,
}

def calculate_freshness_score(last_verified_at: datetime) -> tuple[float, bool]:
    """
    Computes freshness score based on elapsed days.
    Freshness decays gracefully; marks stale if > 90 days.
    """
    now = datetime.now(timezone.utc)
    if last_verified_at.tzinfo is None:
        last_verified_at = last_verified_at.replace(tzinfo=timezone.utc)
    
    elapsed_days = max(0, (now - last_verified_at).total_seconds() / 86400.0)
    
    # Exponential decay with half-life ~ 60 days
    freshness = 100.0 * math.exp(-0.0115 * elapsed_days)
    freshness = max(10.0, min(100.0, freshness))
    is_stale = elapsed_days > 90.0
    return round(freshness, 1), is_stale

def calculate_corroboration_score(place: Place) -> float:
    """
    Evaluates agreement and review mass.
    More authentic reviews provide higher corroboration.
    """
    count = place.review_count or 0
    if count >= 50:
        return 95.0
    elif count >= 20:
        return 85.0
    elif count >= 5:
        return 70.0
    elif count >= 1:
        return 55.0
    return 30.0

def calculate_completeness_score(place: Place) -> tuple[float, List[str]]:
    """
    Checks if essential exploration fields are present.
    Returns completeness score and list of missing fields.
    """
    missing = []
    points = 0
    total = 6

    # 1. Opening hours
    if place.opening_hours and len(place.opening_hours) > 0:
        points += 1
    else:
        missing.append("Operating hours")

    # 2. Photos
    if place.photos and len(place.photos) > 0:
        points += 1
    else:
        missing.append("Verified photographs")

    # 3. Cost / Price level
    if place.estimated_cost_inr > 0 or place.price_level > 0:
        points += 1
    else:
        missing.append("Price or affordability data")

    # 4. Accessibility info
    if place.is_wheelchair_accessible != 0:
        points += 1
    else:
        missing.append("Accessibility / step-free status")

    # 5. Public transit info
    if place.public_transit_access:
        points += 1
    else:
        missing.append("Public transit connectivity details")

    # 6. Description depth
    if place.description and len(place.description) >= 30:
        points += 1
    else:
        missing.append("Detailed description")

    score = round((points / total) * 100.0, 1)
    return score, missing

def evaluate_place_trust(place: Place) -> TrustScoreBreakdown:
    """
    Generates an explainable, multi-factor TrustScoreBreakdown for any place.
    """
    source_score = SOURCE_TIER_SCORES.get(place.verification_tier, 50.0)
    freshness_score, is_stale = calculate_freshness_score(place.last_verified_at)
    corroboration_score = calculate_corroboration_score(place)
    completeness_score, missing = calculate_completeness_score(place)

    # Composite weighted formula
    composite = (
        0.35 * source_score +
        0.25 * freshness_score +
        0.20 * corroboration_score +
        0.20 * completeness_score
    )
    composite = round(max(0.0, min(100.0, composite)), 1)

    uncertainty_reasons = []
    if is_stale:
        uncertainty_reasons.append("Last verification was over 90 days ago.")
    if place.verification_tier == VerificationTier.COMMUNITY and place.review_count < 3:
        uncertainty_reasons.append("Community-sourced report with low corroboration.")
    if "Operating hours" in missing:
        uncertainty_reasons.append("Current operating hours could not be independently confirmed.")
    if "Accessibility / step-free status" in missing:
        uncertainty_reasons.append("Wheelchair accessibility status has not been surveyed.")

    has_uncertainty = len(uncertainty_reasons) > 0

    tier_label = {
        VerificationTier.OFFICIAL: "Authoritative Municipal / State registry",
        VerificationTier.VERIFIED_BUSINESS: "Verified local listing",
        VerificationTier.COMMUNITY: "Community observation",
        VerificationTier.AI_INTERPRETATION: "AI synthesized from public documentation"
    }.get(place.verification_tier, "Unknown source")

    explanation = (
        f"Trust rating: {composite}/100. Grounded in {tier_label}. "
        f"Freshness: {freshness_score}%, Corroboration: {corroboration_score}%, Completeness: {completeness_score}%."
    )

    return TrustScoreBreakdown(
        composite_score=composite,
        source_score=source_score,
        freshness_score=freshness_score,
        corroboration_score=corroboration_score,
        completeness_score=completeness_score,
        verification_tier=place.verification_tier,
        is_stale=is_stale,
        has_uncertainty_warning=has_uncertainty,
        uncertainty_reasons=uncertainty_reasons,
        explanation=explanation
    )
