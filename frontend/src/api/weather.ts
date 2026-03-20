const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3123/api';

export const getWeather = (lat: number, lng: number, date: string) =>
  fetch(`${BASE_URL}/weather?lat=${lat}&lng=${lng}&date=${date}`).then((r) => r.json());
