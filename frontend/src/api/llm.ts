import { apiFetch } from './client';

export interface LlmCall {
  id: number;
  createdAt: string;
  provider: 'openai';
  model: string;
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'json_object' | 'text';
  };
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  responseContent: string;
  usage: {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
  };
}

export const getLlmCalls = (limit = 100) =>
  apiFetch<{ calls: LlmCall[] }>(`/llm/calls?limit=${limit}`);
