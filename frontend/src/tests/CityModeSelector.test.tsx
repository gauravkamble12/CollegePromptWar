import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { CityModeSelector, CITY_MODES } from '../components/CityModeSelector';

describe('CityModeSelector Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all 8 personalized city modes', () => {
    const handleSelect = vi.fn();
    render(<CityModeSelector currentMode="tourist" onSelectMode={handleSelect} />);

    expect(screen.getByText('Personalized City Mode')).toBeDefined();
    CITY_MODES.forEach((mode) => {
      const els = screen.getAllByText(mode.name);
      expect(els.length).toBeGreaterThan(0);
    });
  });

  it('triggers onSelectMode when a persona button is clicked', () => {
    const handleSelect = vi.fn();
    render(<CityModeSelector currentMode="tourist" onSelectMode={handleSelect} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(8);
    // Button index 1 is student mode
    fireEvent.click(buttons[1]);

    expect(handleSelect).toHaveBeenCalledWith('student');
  });
});
