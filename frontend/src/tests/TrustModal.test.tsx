import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TrustModal } from '../components/TrustModal';
import { Place } from '../types';

const mockPlace: Place = {
  id: 1,
  name: "Shaniwar Wada",
  category: "historical",
  description: "18th century fortification.",
  address: "Shaniwar Peth, Pune",
  latitude: 18.5196,
  longitude: 73.8553,
  verification_tier: "official",
  source_attribution: "Archaeological Survey of India (ASI)",
  rating: 4.4,
  review_count: 84,
  estimated_cost_inr: 25,
  price_level: 1,
  opening_hours: {},
  is_wheelchair_accessible: 0,
  has_restrooms: 1,
  has_parking: 1,
  family_friendly: 1,
  cleanliness_score: 82,
  safety_rating: 88,
  connectivity_score: 92,
  historical_significance_score: 98,
  affordability_score: 95,
  photos: [],
  knowledge_tags: [],
  related_place_ids: [],
  trust_indicator: {
    composite_score: 92.5,
    source_score: 100,
    freshness_score: 95,
    corroboration_score: 85,
    completeness_score: 85,
    verification_tier: "official",
    is_stale: false,
    has_uncertainty_warning: false,
    uncertainty_reasons: [],
    explanation: "Trust rating: 92.5/100. Grounded in Authoritative Municipal registry."
  }
};

describe('TrustModal Component', () => {
  it('renders CityTrust composite score and pillars correctly', () => {
    const handleClose = vi.fn();
    render(<TrustModal place={mockPlace} onClose={handleClose} />);

    expect(screen.getByText('CityTrust Intelligence')).toBeDefined();
    expect(screen.getByText('92.5')).toBeDefined();
    expect(screen.getByText('Source Authority')).toBeDefined();
    expect(screen.getByText('Information Freshness')).toBeDefined();
    expect(screen.getByText('Corroboration Mass')).toBeDefined();
    expect(screen.getByText('Data Completeness')).toBeDefined();
  });
});
