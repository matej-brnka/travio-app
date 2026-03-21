const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3123/api';

export const getWeather = (lat: number, lng: number, date: string) =>
  fetch(`${BASE_URL}/weather?lat=${lat}&lng=${lng}&date=${date}`).then((r) => r.json());

export interface TripWeatherResult {
  summary: { temp: number | null; icon: string | null; type: 'forecast' | 'historical' };
  days: { date: string; temp: number | null; tempMin?: number | null; icon: string | null }[];
}

export const getTripWeather = (lat: number, lng: number, dateFrom: string, dateTo: string): Promise<TripWeatherResult> =>
  fetch(`${BASE_URL}/weather/trip?lat=${lat}&lng=${lng}&dateFrom=${dateFrom}&dateTo=${dateTo}`)
    .then((r) => r.json());
