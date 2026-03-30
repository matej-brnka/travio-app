import { apiFetch } from './client';

export interface GooglePlacesCall {
  id: number;
  api: 'places' | 'maps';
  apiType: 'text_search' | 'place_details' | 'place_photo';
  query: string | null;
  placeId: string | null;
  resultCount: number | null;
  createdAt: string;
}

export const getGooglePlacesCalls = (limit = 500) =>
  apiFetch<{ calls: GooglePlacesCall[] }>(`/google-places/calls?limit=${limit}`);
