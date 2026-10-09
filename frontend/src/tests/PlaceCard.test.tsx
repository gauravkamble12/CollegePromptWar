import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlaceCard } from '../components/PlaceCard';

const mockPlace = {
  id: "1",
  name: "Test Monument",
  category: "historical",
  address: "123 Test St",
  latitude: 18.5,
  longitude: 73.8,
  rating: 4.8,
  review_count: 100,
  estimated_cost_inr: 50,
  description: "A very old monument.",
  historical_significance_score: 90,
  cleanliness_score: 80,
  safety_rating: 85,
  connectivity_score: 70,
  is_wheelchair_accessible: 1,
  has_parking: true,
  public_transit_access: "Bus station nearby",
  source_attribution: "Test Source",
  source_url: "http://example.com",
  trust_indicator: { composite_score: 92, last_verified: "2023-01-01", verification_sources: ["Test"] }
};

describe('PlaceCard', () => {
  it('renders correctly', () => {
    const handleSelect = vi.fn();
    const handleOpenTrust = vi.fn();

    render(<PlaceCard place={mockPlace as any} onSelect={handleSelect} onOpenTrust={handleOpenTrust} />);
    
    expect(screen.getByText('Test Monument')).toBeInTheDocument();
    expect(screen.getByText('historical')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CityTrust score 92 out of 100/i })).toBeInTheDocument();
  });

  it('calls handlers when clicked', () => {
    const handleSelect = vi.fn();
    const handleOpenTrust = vi.fn();

    render(<PlaceCard place={mockPlace as any} onSelect={handleSelect} onOpenTrust={handleOpenTrust} />);
    
    // Click trust badge
    fireEvent.click(screen.getByRole('button', { name: /CityTrust score 92 out of 100/i }));
    expect(handleOpenTrust).toHaveBeenCalledWith(mockPlace);

    // Click details
    fireEvent.click(screen.getByText('Test Monument'));
    expect(handleSelect).toHaveBeenCalledWith(mockPlace);
  });
});
