from typing import List, Dict
from backend.app.models.place import Place
from backend.app.schemas.comparison import ComparisonWeights, ComparisonPlaceResult, DimensionScore, ComparisonResponse

def compare_places(places: List[Place], weights: ComparisonWeights = None) -> ComparisonResponse:
    if not weights:
        weights = ComparisonWeights()

    # Normalize weights so sum equals 1.0
    total_w = (
        weights.affordability +
        weights.cleanliness +
        weights.accessibility +
        weights.ratings +
        weights.connectivity +
        weights.historical_significance
    )
    if total_w == 0:
        total_w = 1.0
    
    w_afford = weights.affordability / total_w
    w_clean = weights.cleanliness / total_w
    w_access = weights.accessibility / total_w
    w_rating = weights.ratings / total_w
    w_conn = weights.connectivity / total_w
    w_hist = weights.historical_significance / total_w

    results: List[ComparisonPlaceResult] = []

    for p in places:
        # Normalized dimension scores
        afford_norm = max(0.0, min(100.0, p.affordability_score or 70.0))
        clean_norm = max(0.0, min(100.0, p.cleanliness_score or 75.0))
        
        # Accessibility normalization
        access_norm = 100.0 if p.is_wheelchair_accessible == 1 else (30.0 if p.is_wheelchair_accessible == -1 else 50.0)
        
        # Rating normalization: 5-star converted to 0-100
        rating_norm = max(0.0, min(100.0, ((p.rating or 3.5) / 5.0) * 100.0))
        conn_norm = max(0.0, min(100.0, p.connectivity_score or 70.0))
        hist_norm = max(0.0, min(100.0, p.historical_significance_score or 50.0))

        # Composite score
        composite = (
            w_afford * afford_norm +
            w_clean * clean_norm +
            w_access * access_norm +
            w_rating * rating_norm +
            w_conn * conn_norm +
            w_hist * hist_norm
        )
        composite = round(composite, 1)

        dim_scores = {
            "affordability": DimensionScore(
                dimension="Affordability",
                raw_value=float(p.estimated_cost_inr),
                normalized_score=round(afford_norm, 1),
                weighted_score=round(w_afford * afford_norm, 1),
                label=f"₹{p.estimated_cost_inr} est." if p.estimated_cost_inr > 0 else "Free / Nominal"
            ),
            "cleanliness": DimensionScore(
                dimension="Cleanliness",
                raw_value=round(clean_norm, 1),
                normalized_score=round(clean_norm, 1),
                weighted_score=round(w_clean * clean_norm, 1),
                label=f"{clean_norm}/100"
            ),
            "accessibility": DimensionScore(
                dimension="Accessibility",
                raw_value=float(p.is_wheelchair_accessible),
                normalized_score=round(access_norm, 1),
                weighted_score=round(w_access * access_norm, 1),
                label=(
                    "Wheelchair Step-Free" if p.is_wheelchair_accessible == 1
                    else "Steps / Limited Access" if p.is_wheelchair_accessible == -1
                    else "Accessibility Unverified"
                )
            ),
            "ratings": DimensionScore(
                dimension="Ratings & Reviews",
                raw_value=round(p.rating, 1),
                normalized_score=round(rating_norm, 1),
                weighted_score=round(w_rating * rating_norm, 1),
                label=f"{p.rating} ★ ({p.review_count} reviews)"
            ),
            "connectivity": DimensionScore(
                dimension="Transit Connectivity",
                raw_value=round(conn_norm, 1),
                normalized_score=round(conn_norm, 1),
                weighted_score=round(w_conn * conn_norm, 1),
                label=p.public_transit_access or "Nearby roads"
            ),
            "historical_significance": DimensionScore(
                dimension="Historical Heritage",
                raw_value=round(hist_norm, 1),
                normalized_score=round(hist_norm, 1),
                weighted_score=round(w_hist * hist_norm, 1),
                label=f"{hist_norm}/100 Heritage Index"
            ),
        }

        # Pros and Cons evaluation
        pros = []
        cons = []
        if afford_norm >= 80: pros.append("Highly budget-friendly")
        elif afford_norm < 50: cons.append("Higher estimated expenditure")

        if clean_norm >= 80: pros.append("High civic cleanliness ratings")
        elif clean_norm < 60: cons.append("Moderate cleanliness reported")

        if access_norm >= 80: pros.append("Accessible step-free facilities")
        elif access_norm <= 40: cons.append("Noticeable physical stairs or obstacles")

        if rating_norm >= 80: pros.append("Consistently strong visitor reviews")
        if hist_norm >= 80: pros.append("Exceptional cultural & historical depth")

        # Persona match
        if access_norm >= 80 and clean_norm >= 80:
            persona = "Best for Families & Seniors (High accessibility & clean environment)"
        elif afford_norm >= 85:
            persona = "Best for Students & Solo Budget Explorers"
        elif hist_norm >= 85:
            persona = "Best for History Enthusiasts & Cultural Tourists"
        else:
            persona = "Balanced Daily Discovery"

        results.append(ComparisonPlaceResult(
            place_id=p.id,
            name=p.name,
            category=p.category,
            composite_score=composite,
            safety_observation_rating=round(p.safety_rating or 80.0, 1),
            dimension_scores=dim_scores,
            pros=pros or ["Solid all-around option"],
            cons=cons or ["Standard city crowd conditions"],
            best_for_persona=persona,
            data_freshness_warning=None
        ))

    # Sort descending by composite score
    results.sort(key=lambda x: x.composite_score, reverse=True)
    top_place = results[0]

    rationale = (
        f"Based on your active weight profile, '{top_place.name}' achieves the strongest alignment "
        f"with a composite score of {top_place.composite_score}/100. "
        f"Specialization: {top_place.best_for_persona}."
    )

    return ComparisonResponse(
        places=results,
        top_recommended_place_id=top_place.place_id,
        rationale=rationale
    )
