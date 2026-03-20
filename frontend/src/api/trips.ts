import { apiFetch } from './client';

export const getTrips = () => apiFetch<any[]>('/trips');
export const getTrip = (id: string) => apiFetch<any>(`/trips/${id}`);
export const createTrip = (data: any) =>
  apiFetch<any>('/trips', { method: 'POST', body: JSON.stringify(data) });
export const updateTrip = (id: string, data: any) =>
  apiFetch<any>(`/trips/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTrip = (id: string) =>
  apiFetch(`/trips/${id}`, { method: 'DELETE' });
export const shareTrip = (id: string) =>
  apiFetch<{ shareUrl: string }>(`/trips/${id}/share`);
