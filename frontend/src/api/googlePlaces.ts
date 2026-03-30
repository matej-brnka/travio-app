import { apiFetch } from './client';

export interface GooglePlacesCall {
  id: number;
  api: 'places' | 'maps';
  apiType:
    | 'text_search_pro'
    | 'text_search'
    | 'place_details_pro'
    | 'place_details_essentials'
    | 'place_details'
    | 'place_photo'
    | 'map_load';
  query: string | null;
  placeId: string | null;
  resultCount: number | null;
  createdAt: string;
}

export const getGooglePlacesCalls = (limit = 500) =>
  apiFetch<{ calls: GooglePlacesCall[] }>(`/google-places/calls?limit=${limit}`);
