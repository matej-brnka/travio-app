import { apiFetch } from './client';

export interface DestinationResult {
  name: string;
  description: string;
  placeId: string;
  lat: number | null;
  lng: number | null;
}

export const searchPlaces = (q: string, centerLat?: number | null, centerLng?: number | null) => {
  const params = new URLSearchParams({ q });
  if (centerLat != null) params.set('centerLat', String(centerLat));
  if (centerLng != null) params.set('centerLng', String(centerLng));
  return apiFetch<any[]>(`/places/search?${params}`);
};

export const searchDestinations = (q: string) =>
  apiFetch<DestinationResult[]>(`/places/search-destinations?q=${encodeURIComponent(q)}`);
