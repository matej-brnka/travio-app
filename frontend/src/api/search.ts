import { apiFetch } from './client';

export const searchPlaces = (q: string) =>
  apiFetch<any[]>(`/places/search?q=${encodeURIComponent(q)}`);
