import { apiFetch } from './client';

export const createPlace = (tripId: string, data: any) =>
  apiFetch<any>(`/trips/${tripId}/places`, { method: 'POST', body: JSON.stringify(data) });
export const updatePlace = (tripId: string, placeId: string, data: any) =>
  apiFetch<any>(`/trips/${tripId}/places/${placeId}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deletePlace = (tripId: string, placeId: string) =>
  apiFetch(`/trips/${tripId}/places/${placeId}`, { method: 'DELETE' });
export const movePlace = (tripId: string, placeId: string, targetDayId: string | null) =>
  apiFetch<any>(`/trips/${tripId}/places/${placeId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ targetDayId }),
  });
export const reorderPlaces = (tripId: string, dayId: string | null, placeIds: string[]) => {
  const dayPart = dayId ?? 'unassigned';
  return apiFetch<any>(`/trips/${tripId}/days/${dayPart}/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ placeIds }),
  });
};
