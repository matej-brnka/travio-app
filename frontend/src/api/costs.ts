import { apiFetch } from './client';

export interface LlmDayStat {
  date: string;           // YYYY-MM-DD
  model: string;
  calls: number;
  promptTokens: number;
  completionTokens: number;
}

export interface GooglePlacesDayStat {
  date: string;           // YYYY-MM-DD
  api: 'places' | 'maps';
  apiType: string;
  calls: number;
}

export interface CostSummary {
  days: number;
  llm: LlmDayStat[];
  googlePlaces: GooglePlacesDayStat[];
}

export const getCostSummary = (days: number) =>
  apiFetch<CostSummary>(`/service/costs?days=${days}`);
