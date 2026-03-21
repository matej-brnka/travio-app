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

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3123/api';
export const getSharedTrip = async (token: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/shared/${token}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};
