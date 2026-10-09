import { Place } from '../types';

/**
 * Resolves a display image for a place.
 *
 * Priority:
 *  1. A real photo supplied by the data source (curated seed or OpenStreetMap).
 *  2. A deterministic, per-place fallback image so no two places share the
 *     same picture (keyed by category + id + name).
 */
export function getPlaceImage(
  place: Pick<Place, 'id' | 'name' | 'category' | 'photos'>
): string {
  if (place.photos && place.photos.length > 0 && place.photos[0]) {
    return place.photos[0];
  }
  const seed = encodeURIComponent(`${place.category}-${place.id}-${place.name}`);
  return `https://picsum.photos/seed/${seed}/800/600`;
}
