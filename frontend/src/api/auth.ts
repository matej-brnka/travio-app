import { apiFetch } from './client';

export interface MeResponse {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  isAdmin: boolean;
}

export const getMe = () => apiFetch<MeResponse>('/auth/me');
