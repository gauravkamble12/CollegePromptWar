from datetime import datetime, timezone, timedelta
from backend.app.models.user import User, UserPreference, RoleEnum
from backend.app.models.place import Place, VerificationTier
from backend.app.models.report import CivicReport, ReportCategory, ReportStatus, ModerationLog
from backend.app.models.pulse import WeatherAlertRecord, ProviderHealthRecord
from backend.app.security.auth import hash_password

SEED_PLACES = [
    {
        "name": "Shaniwar Wada",
        "category": "historical",
        "description": "Historic 18th-century fortification in the heart of Pune. Built in 1732 as the great seat of the Peshwa rulers of the Maratha Empire.",
        "address": "Shaniwar Peth, Pune, Maharashtra 411030",
        "latitude": 18.5196,
        "longitude": 73.8553,
        "verification_tier": VerificationTier.OFFICIAL,
        "source_attribution": "Archaeological Survey of India (ASI) & Pune Municipal Corporation",
        "source_url": "https://asi.nic.in",
        "rating": 4.4,
        "review_count": 84,
        "estimated_cost_inr": 25,
        "price_level": 1,
        "opening_hours": {"open": "09:30", "close": "17:30", "days": ["Daily"]},
        "is_wheelchair_accessible": 0, # Steps at main Dilli Darwaza
        "has_restrooms": 1,
        "has_parking": 1,
        "family_friendly": 1,
        "public_transit_access": "Swargate / PMC Bus stop (200m)",
        "cleanliness_score": 82.0,
        "safety_rating": 88.0,
        "connectivity_score": 92.0,
        "historical_significance_score": 98.0,
        "affordability_score": 95.0,
        "photos": ["https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["Peshwa Architecture", "Maratha Empire", "Heritage Monument"],
        "related_place_ids": [2, 6]
    },
    {
        "name": "Aga Khan Palace",
        "category": "museum",
        "description": "Majestic palace built in 1892 by Sultan Muhammed Shah Aga Khan III. Served as a prison for Mahatma Gandhi during the Quit India movement.",
        "address": "Pune-Ahmednagar Road, Kalyani Nagar, Pune 411014",
        "latitude": 18.5524,
        "longitude": 73.9015,
        "verification_tier": VerificationTier.OFFICIAL,
        "source_attribution": "Archaeological Survey of India (Monument of National Importance)",
        "source_url": "https://asi.nic.in",
        "rating": 4.6,
        "review_count": 92,
        "estimated_cost_inr": 50,
        "price_level": 1,
        "opening_hours": {"open": "09:00", "close": "17:30", "days": ["Daily"]},
        "is_wheelchair_accessible": 1, # Ramp available at ground floor memorials
        "has_restrooms": 1,
        "has_parking": 1,
        "family_friendly": 1,
        "public_transit_access": "Kalyani Nagar Metro Station & Bus Depot",
        "cleanliness_score": 90.0,
        "safety_rating": 94.0,
        "connectivity_score": 85.0,
        "historical_significance_score": 96.0,
        "affordability_score": 90.0,
        "photos": ["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["Freedom Movement", "Italian Arches", "Gandhi Memorial"],
        "related_place_ids": [1, 6]
    },
    {
        "name": "Vaishali Restaurant & Cafe",
        "category": "restaurant",
        "description": "Iconic cultural and culinary institution on Fergusson College Road. Renowned for crispy Masala Dosa, SPDP, and vibrant outdoor courtyard.",
        "address": "Fergusson College Rd, Shivajinagar, Pune 411004",
        "latitude": 18.5236,
        "longitude": 73.8415,
        "verification_tier": VerificationTier.VERIFIED_BUSINESS,
        "source_attribution": "Direct Restaurant Merchant Listing & Food Safety Registry (FSSAI)",
        "source_url": "https://fssai.gov.in",
        "rating": 4.7,
        "review_count": 120,
        "estimated_cost_inr": 250,
        "price_level": 2,
        "opening_hours": {"open": "07:00", "close": "23:00", "days": ["Daily"]},
        "is_wheelchair_accessible": 1,
        "has_restrooms": 1,
        "has_parking": 0,
        "family_friendly": 1,
        "public_transit_access": "Shivajinagar Station / FC Road Bus Stop",
        "cleanliness_score": 88.0,
        "safety_rating": 92.0,
        "connectivity_score": 90.0,
        "historical_significance_score": 65.0,
        "affordability_score": 82.0,
        "photos": ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["FC Road Culture", "South Indian Delicacies", "Student Hub"],
        "related_place_ids": [4, 9]
    },
    {
        "name": "Kata Kirr Misal",
        "category": "street_food",
        "description": "Pune's celebrated spicy Misal Pav destination, serving fiery Tarri, farsan, and fresh pav with iced taak (buttermilk).",
        "address": "Dr Ketkar Rd, Erandwane, Pune 411004",
        "latitude": 18.5133,
        "longitude": 73.8329,
        "verification_tier": VerificationTier.VERIFIED_BUSINESS,
        "source_attribution": "Verified Food Explorer Registry & FSSAI Licensed",
        "source_url": "https://fssai.gov.in",
        "rating": 4.5,
        "review_count": 78,
        "estimated_cost_inr": 120,
        "price_level": 1,
        "opening_hours": {"open": "08:00", "close": "15:00", "days": ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]},
        "is_wheelchair_accessible": 1,
        "has_restrooms": 1,
        "has_parking": 0,
        "family_friendly": 1,
        "public_transit_access": "Garware College Metro Station (400m)",
        "cleanliness_score": 84.0,
        "safety_rating": 90.0,
        "connectivity_score": 86.0,
        "historical_significance_score": 40.0,
        "affordability_score": 92.0,
        "photos": ["https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["Puneri Misal", "Maharashtrian Street Food", "Spicy Specialties"],
        "related_place_ids": [3]
    },
    {
        "name": "Raja Dinkar Kelkar Museum",
        "category": "museum",
        "description": "Unique museum containing Dr. D.G. Kelkar's personal collection of over 20,000 traditional Indian artifacts, musical instruments, and Mastani Mahal recreation.",
        "address": "1377-78, Kamal Kunj, Bajirao Rd, Shukrawar Peth, Pune 411002",
        "latitude": 18.5108,
        "longitude": 73.8542,
        "verification_tier": VerificationTier.OFFICIAL,
        "source_attribution": "Maharashtra Department of Archaeology & Museums",
        "source_url": "https://maharashtratourism.gov.in",
        "rating": 4.5,
        "review_count": 65,
        "estimated_cost_inr": 100,
        "price_level": 1,
        "opening_hours": {"open": "10:00", "close": "17:30", "days": ["Daily"]},
        "is_wheelchair_accessible": 0, # Multi-level staircases
        "has_restrooms": 1,
        "has_parking": 0,
        "family_friendly": 1,
        "public_transit_access": "Bajirao Road Bus stop (100m)",
        "cleanliness_score": 86.0,
        "safety_rating": 89.0,
        "connectivity_score": 88.0,
        "historical_significance_score": 92.0,
        "affordability_score": 88.0,
        "photos": ["https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["Indian Heritage Crafts", "Mastani Mahal", "Antique Instruments"],
        "related_place_ids": [1]
    },
    {
        "name": "Pu La Deshpande Japanese Garden",
        "category": "park",
        "description": "Serene Japanese Zen garden spread over 10 acres, designed on the model of the Korakuen Garden in Okayama. Features canals, ponds, and walkways.",
        "address": "Sinhagad Rd, Manik Baug, Pune 411030",
        "latitude": 18.4912,
        "longitude": 73.8340,
        "verification_tier": VerificationTier.OFFICIAL,
        "source_attribution": "Pune Municipal Corporation (PMC Garden Dept)",
        "source_url": "https://pmc.gov.in",
        "rating": 4.5,
        "review_count": 88,
        "estimated_cost_inr": 20,
        "price_level": 1,
        "opening_hours": {"open": "06:00", "close": "19:30", "days": ["Daily"]},
        "is_wheelchair_accessible": 1, # Smooth stone ramps along primary circuit
        "has_restrooms": 1,
        "has_parking": 1,
        "family_friendly": 1,
        "public_transit_access": "Sinhagad Road Bus Stop (150m)",
        "cleanliness_score": 92.0,
        "safety_rating": 93.0,
        "connectivity_score": 78.0,
        "historical_significance_score": 60.0,
        "affordability_score": 98.0,
        "photos": ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["Zen Landscape", "Eco Promenade", "Family Recreation"],
        "related_place_ids": [7]
    },
    {
        "name": "Saras Baug & Peshwa Ganpati Temple",
        "category": "park",
        "description": "Historic public park and scenic lake temple dedicated to Talyatla Ganpati, commissioned by Peshwa Sawai Madhavrao in 1784.",
        "address": "Saras Baug, Sadashiv Peth, Pune 411030",
        "latitude": 18.5009,
        "longitude": 73.8540,
        "verification_tier": VerificationTier.OFFICIAL,
        "source_attribution": "Pune Municipal Corporation & Temple Trust",
        "source_url": "https://pmc.gov.in",
        "rating": 4.6,
        "review_count": 75,
        "estimated_cost_inr": 0, # Free entrance
        "price_level": 1,
        "opening_hours": {"open": "06:00", "close": "21:00", "days": ["Daily"]},
        "is_wheelchair_accessible": 1,
        "has_restrooms": 1,
        "has_parking": 1,
        "family_friendly": 1,
        "public_transit_access": "Swargate Metro / Bus Nexus (600m)",
        "cleanliness_score": 85.0,
        "safety_rating": 90.0,
        "connectivity_score": 94.0,
        "historical_significance_score": 85.0,
        "affordability_score": 100.0,
        "photos": ["https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["Peshwa Temple", "Lush Lawns", "Chaupati Street Snacks"],
        "related_place_ids": [1, 6]
    },
    {
        "name": "FC Road & Hong Kong Lane Shopping",
        "category": "shopping",
        "description": "Electrifying street market famous for trendy college apparel, accessories, books, and street food at bargain prices.",
        "address": "Fergusson College Rd, Shivajinagar, Pune 411004",
        "latitude": 18.5225,
        "longitude": 73.8420,
        "verification_tier": VerificationTier.COMMUNITY,
        "source_attribution": "Student & Merchant Guild Observations (Verified Dec 2025)",
        "source_url": None,
        "rating": 4.3,
        "review_count": 60,
        "estimated_cost_inr": 350,
        "price_level": 1,
        "opening_hours": {"open": "11:00", "close": "21:30", "days": ["Daily"]},
        "is_wheelchair_accessible": -1, # Narrow congested pedestrian walkway
        "has_restrooms": 0,
        "has_parking": 0,
        "family_friendly": 1,
        "public_transit_access": "Shivajinagar Station (1.2km)",
        "cleanliness_score": 68.0,
        "safety_rating": 78.0,
        "connectivity_score": 88.0,
        "historical_significance_score": 45.0,
        "affordability_score": 90.0,
        "photos": ["https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["Budget Fashion", "Student Hub", "Bargaining"],
        "related_place_ids": [3]
    },
    {
        "name": "Jehangir Hospital Emergency Care",
        "category": "hospital",
        "description": "NABH-accredited tertiary care multi-speciality hospital with 24x7 trauma, emergency and ambulance services.",
        "address": "32, Sassoon Rd, Opposite Railway Station, Pune 411001",
        "latitude": 18.5284,
        "longitude": 73.8738,
        "verification_tier": VerificationTier.OFFICIAL,
        "source_attribution": "National Health Portal & Maharashtra Directorate of Health",
        "source_url": "https://jehangirhospital.com",
        "rating": 4.5,
        "review_count": 95,
        "estimated_cost_inr": 500,
        "price_level": 2,
        "opening_hours": {"open": "00:00", "close": "23:59", "days": ["24x7 Emergency"]},
        "is_wheelchair_accessible": 1,
        "has_restrooms": 1,
        "has_parking": 1,
        "family_friendly": 1,
        "public_transit_access": "Pune Railway Station (300m)",
        "cleanliness_score": 96.0,
        "safety_rating": 98.0,
        "connectivity_score": 95.0,
        "historical_significance_score": 50.0,
        "affordability_score": 70.0,
        "photos": ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["24x7 Emergency", "Trauma Center", "Critical Care"],
        "related_place_ids": [10]
    },
    {
        "name": "Pune Junction Railway & Metro Central Hub",
        "category": "transit",
        "description": "Central transport terminus integrating national rail lines, Pune Metro Line 2 interchange, and city bus depots.",
        "address": "Station Rd, Agarkar Nagar, Pune 411001",
        "latitude": 18.5289,
        "longitude": 73.8744,
        "verification_tier": VerificationTier.OFFICIAL,
        "source_attribution": "Indian Railways (Central Railway) & Maha Metro",
        "source_url": "https://punemetrorail.org",
        "rating": 4.2,
        "review_count": 110,
        "estimated_cost_inr": 20,
        "price_level": 1,
        "opening_hours": {"open": "00:00", "close": "23:59", "days": ["24x7 Transit"]},
        "is_wheelchair_accessible": 1, # Lifts and tactile paths to platforms
        "has_restrooms": 1,
        "has_parking": 1,
        "family_friendly": 1,
        "public_transit_access": "Central Intermodal Terminal",
        "cleanliness_score": 74.0,
        "safety_rating": 82.0,
        "connectivity_score": 99.0,
        "historical_significance_score": 75.0,
        "affordability_score": 96.0,
        "photos": ["https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80"],
        "knowledge_tags": ["Metro Hub", "Interstate Rail", "Tactile Navigation"],
        "related_place_ids": [9]
    }
]

def seed_database(db):
    """
    Seeds initial users (admin, moderator, user), places, reports, and pulse data.
    Idempotent: skips if data already seeded.
    """
    if db.query(User).count() > 0:
        return

    # 1. Create Default Users
    admin_user = User(
        email="admin@citylife.org",
        username="admin",
        hashed_password=hash_password("admin123"),
        full_name="City Life Administrator",
        role=RoleEnum.ADMIN
    )
    mod_user = User(
        email="moderator@citylife.org",
        username="moderator",
        hashed_password=hash_password("mod123"),
        full_name="Civic Review Moderator",
        role=RoleEnum.MODERATOR
    )
    test_user = User(
        email="explorer@citylife.org",
        username="explorer",
        hashed_password=hash_password("user123"),
        full_name="Pune Explorer",
        role=RoleEnum.USER
    )

    db.add_all([admin_user, mod_user, test_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(mod_user)
    db.refresh(test_user)

    # Preferences
    pref = UserPreference(
        user_id=test_user.id,
        default_city_mode="tourist",
        preferred_transport="walking",
        budget_level="budget",
        accessibility_required=0
    )
    db.add(pref)

    # 2. Add Places
    for p_data in SEED_PLACES:
        place = Place(
            name=p_data["name"],
            category=p_data["category"],
            description=p_data["description"],
            address=p_data["address"],
            latitude=p_data["latitude"],
            longitude=p_data["longitude"],
            verification_tier=p_data["verification_tier"],
            source_attribution=p_data["source_attribution"],
            source_url=p_data["source_url"],
            rating=p_data["rating"],
            review_count=p_data["review_count"],
            estimated_cost_inr=p_data["estimated_cost_inr"],
            price_level=p_data["price_level"],
            opening_hours=p_data["opening_hours"],
            is_wheelchair_accessible=p_data["is_wheelchair_accessible"],
            has_restrooms=p_data["has_restrooms"],
            has_parking=p_data["has_parking"],
            family_friendly=p_data["family_friendly"],
            public_transit_access=p_data["public_transit_access"],
            cleanliness_score=p_data["cleanliness_score"],
            safety_rating=p_data["safety_rating"],
            connectivity_score=p_data["connectivity_score"],
            historical_significance_score=p_data["historical_significance_score"],
            affordability_score=p_data["affordability_score"],
            photos=p_data["photos"],
            knowledge_tags=p_data["knowledge_tags"],
            related_place_ids=p_data["related_place_ids"],
            last_verified_at=datetime.now(timezone.utc) - timedelta(days=12)
        )
        db.add(place)
    db.commit()

    # 3. Add Civic Reports (Community Observations)
    rep1 = CivicReport(
        reporter_id=test_user.id,
        category=ReportCategory.ROAD_DAMAGE,
        title="Substantial Pothole on FC Road Pedestrian Crossing",
        description="Deep asphalt depression near the college entrance making night crossing hazardous for two-wheelers and pedestrians.",
        latitude=18.5228,
        longitude=73.8418,
        address_reference="FC Road near Goodluck Chowk",
        status=ReportStatus.VERIFIED,
        severity_level="high",
        corroboration_count=3,
        ai_vision_tags=["pothole", "asphalt_crack", "road_hazard"]
    )
    rep2 = CivicReport(
        reporter_id=test_user.id,
        category=ReportCategory.BROKEN_STREETLIGHTS,
        title="Flickering / Inoperative Streetlights on Shaniwar Peth Lane",
        description="Three consecutive municipal light poles off since Tuesday. Sidewalk visibility is low after 8 PM.",
        latitude=18.5190,
        longitude=73.8548,
        address_reference="Lane 4, Shaniwar Peth",
        status=ReportStatus.PENDING_REVIEW,
        severity_level="medium",
        corroboration_count=1,
        ai_vision_tags=["street_pole", "dark_alley"]
    )
    rep3 = CivicReport(
        reporter_id=None, # Anonymous
        category=ReportCategory.ACCESSIBILITY_OBSTACLE,
        title="Broken Ramp Curb at Bajirao Road Corner",
        description="Ramp cracked with 4-inch uneven ledge blocking wheelchair passage into shopping walkway.",
        latitude=18.5112,
        longitude=73.8539,
        address_reference="Bajirao Rd near Kelkar Museum junction",
        status=ReportStatus.RESOLVED,
        severity_level="medium",
        corroboration_count=2
    )
    db.add_all([rep1, rep2, rep3])
    db.commit()

    # 4. Add Moderation Log for rep1
    mod_log = ModerationLog(
        report_id=rep1.id,
        moderator_id=mod_user.id,
        previous_status=ReportStatus.PENDING_REVIEW.value,
        new_status=ReportStatus.VERIFIED.value,
        moderator_note="Corroborated by 2 other citizen reports. Municipal ward engineer notified.",
        action_timestamp=datetime.now(timezone.utc) - timedelta(hours=5)
    )
    db.add(mod_log)

    # 5. Add Live City Pulse baseline records
    alert1 = WeatherAlertRecord(
        city="Pune",
        severity="advisory",
        title="Urban Heat & Afternoon UV Advisory",
        description="Sunny afternoon temperatures expected around 29°C. Carry hydration when taking walking tours.",
        temperature_c=28.5,
        weather_condition="Mainly Sunny",
        wind_speed_kmh=10.5,
        source_attribution="Open-Meteo Meteorological Service"
    )
    prov1 = ProviderHealthRecord(
        provider_name="open_meteo",
        is_operational=1,
        latency_ms=120.0,
        status_message="Healthy & Connected"
    )
    prov2 = ProviderHealthRecord(
        provider_name="osrm_routing",
        is_operational=1,
        latency_ms=85.0,
        status_message="Online"
    )
    prov3 = ProviderHealthRecord(
        provider_name="overpass_osm",
        is_operational=1,
        latency_ms=145.0,
        status_message="Online"
    )
    db.add_all([alert1, prov1, prov2, prov3])
    db.commit()
