import { describe, it, expect } from 'vitest';
import { getPlaceImage } from '../lib/placeImage';

describe('getPlaceImage', () => {
  it('returns the first real photo when available', () => {
    const url = getPlaceImage({
      id: 1,
      name: 'Shaniwar Wada',
      category: 'historical',
      photos: ['https://cdn.example.com/wada.jpg'],
    });
    expect(url).toBe('https://cdn.example.com/wada.jpg');
  });

  it('ignores empty photo entries and uses the deterministic fallback', () => {
    const url = getPlaceImage({ id: 1, name: 'A', category: 'cafe', photos: [''] });
    expect(url).toContain('picsum.photos/seed/');
  });

  it('produces distinct, stable fallbacks for different places', () => {
    const a = getPlaceImage({ id: 1, name: 'A', category: 'cafe', photos: [] });
    const b = getPlaceImage({ id: 2, name: 'B', category: 'cafe', photos: [] });
    const aAgain = getPlaceImage({ id: 1, name: 'A', category: 'cafe', photos: [] });

    expect(a).not.toBe(b);
    expect(aAgain).toBe(a);
  });
});
