export type VerificationTier = 'official' | 'verified_business' | 'community' | 'ai_interpretation';

export interface TrustScoreBreakdown {
  composite_score: number;
  source_score: number;
  freshness_score: number;
  corroboration_score: number;
  completeness_score: number;
  verification_tier: VerificationTier;
  is_stale: boolean;
  has_uncertainty_warning: boolean;
  uncertainty_reasons: string[];
  explanation: string;
}

export interface Place {
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  verification_tier: VerificationTier;
  source_attribution: string;
  source_url?: string;
  rating: number;
  review_count: number;
  estimated_cost_inr: number;
  price_level: number;
  opening_hours: {
    open?: string;
    close?: string;
    days?: string[];
  };
  is_wheelchair_accessible: number; // 1 = yes, 0 = unknown, -1 = inaccessible
  has_restrooms: number;
  has_parking: number;
  family_friendly: number;
  public_transit_access?: string;
  cleanliness_score: number;
  safety_rating: number;
  connectivity_score: number;
  historical_significance_score: number;
  affordability_score: number;
  photos: string[];
  knowledge_tags: string[];
  related_place_ids: number[];
  trust_indicator?: TrustScoreBreakdown;
  distance_km?: number;
  travel_time_min?: number;
  why_recommended?: string;
  missing_information?: string[];
}

export interface CivicReport {
  id: number;
  reporter_id?: number;
  category: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address_reference?: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'pending_review' | 'verified' | 'rejected' | 'needs_more_info' | 'resolved';
  photo_url?: string;
  voice_note_url?: string;
  voice_transcript?: string;
  ai_vision_tags: string[];
  corroboration_count: number;
  is_duplicate_of_id?: number;
  created_at: string;
  updated_at: string;
}

export interface RouteOption {
  id: string;
  name: string;
  distance_km: number;
  duration_min: number;
  reported_hazards: number;
  road_closure_alerts: number;
  lighting_quality: string;
  accessibility_rating: string;
  recommendation_summary: string;
  waypoints: [number, number][];
}

export interface RouteComparisonResponse {
  origin: [number, number];
  destination: [number, number];
  mode: string;
  routes: RouteOption[];
  recommended_route_id: string;
  factors_considered: string[];
  safety_disclaimer: string;
}

export interface ItineraryStop {
  order_index: number;
  place_id?: number;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  suggested_arrival: string;
  duration_minutes: number;
  travel_time_from_previous_min: number;
  cost_inr: number;
  notes: string;
  why_recommended: string;
}

export interface ItineraryPlan {
  title: string;
  city: string;
  total_hours: number;
  total_budget_inr: number;
  total_estimated_cost: number;
  transport_mode: string;
  city_mode: string;
  stops: ItineraryStop[];
  responsible_travel_score: number;
  weather_summary?: string;
  alternatives: string[];
}

export interface ComparisonDimensionScore {
  dimension: string;
  raw_value: number;
  normalized_score: number;
  weighted_score: number;
  label: string;
}

export interface ComparisonPlaceItem {
  place_id: number;
  name: string;
  category: string;
  composite_score: number;
  safety_observation_rating: number;
  dimension_scores: Record<string, ComparisonDimensionScore>;
  pros: string[];
  cons: string[];
  best_for_persona: string;
}

export interface ComparisonResult {
  places: ComparisonPlaceItem[];
  top_recommended_place_id: number;
  rationale: string;
  disclaimer: string;
}

export interface WeatherAlertItem {
  id: number;
  severity: string;
  title: string;
  description: string;
  temperature_c?: number;
  weather_condition?: string;
  wind_speed_kmh?: number;
  source_attribution: string;
  observed_at: string;
}

export interface ProviderStatus {
  provider_name: string;
  is_operational: boolean;
  latency_ms: number;
  last_checked_at: string;
  status_message: string;
}

export interface CityPulseData {
  city: string;
  current_temperature_c?: number;
  weather_condition?: string;
  air_quality_summary?: string;
  active_weather_alerts: WeatherAlertItem[];
  recent_civic_reports_count: number;
  resolved_civic_reports_count: number;
  top_active_hazards: string[];
  providers: ProviderStatus[];
  pulse_timestamp: string;
  is_live_data: boolean;
  last_sync_note: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: 'user' | 'moderator' | 'admin';
  is_active: number;
}
