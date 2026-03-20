import { apiFetch } from './client';

export const addDay = (tripId: string) =>
  apiFetch<any>(`/trips/${tripId}/days`, { method: 'POST' });
export const removeDay = (tripId: string, dayId: string) =>
  apiFetch(`/trips/${tripId}/days/${dayId}`, { method: 'DELETE' });
