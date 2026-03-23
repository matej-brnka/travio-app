import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { LlmMessage, LlmOptions } from './interfaces/llm-provider.interface';

export interface LlmCallRecord {
  id: number;
  provider: string;
  model: string;
  options: LlmOptions;
  messages: LlmMessage[];
  responseContent: string;
  usage: {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
  };
  createdAt: string;
}

@Injectable()
export class LlmCallsService {
  private readonly logger = new Logger(LlmCallsService.name);

  constructor(private supabase: SupabaseService) {}

  async logCall(data: {
    provider: string;
    model: string;
    options: LlmOptions;
    messages: LlmMessage[];
    responseContent: string;
    usage: {
      promptTokens: number | null;
      completionTokens: number | null;
      totalTokens: number | null;
    };
  }): Promise<void> {
    try {
      await this.supabase.query(
        `INSERT INTO llm_calls
          (provider, model, options, messages, response_content, prompt_tokens, completion_tokens, total_tokens)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8)`,
        [
          data.provider,
          data.model,
          JSON.stringify(data.options ?? {}),
          JSON.stringify(data.messages ?? []),
          data.responseContent ?? '',
          data.usage.promptTokens,
          data.usage.completionTokens,
          data.usage.totalTokens,
        ],
      );
    } catch (err: any) {
      this.logger.warn(`Failed to save LLM call to DB: ${err?.message ?? err}`);
    }
  }

  async listCalls(limit = 100): Promise<LlmCallRecord[]> {
    const safeLimit = Math.max(1, Math.min(limit, 500));
    const rows = await this.supabase.query<any>(
      `SELECT id, provider, model, options, messages, response_content, prompt_tokens, completion_tokens, total_tokens, created_at
       FROM llm_calls
       ORDER BY created_at DESC
       LIMIT $1`,
      [safeLimit],
    );
    return rows.map((r) => ({
      id: r.id,
      provider: r.provider,
      model: r.model,
      options: r.options ?? {},
      messages: r.messages ?? [],
      responseContent: r.response_content ?? '',
      usage: {
        promptTokens: r.prompt_tokens ?? null,
        completionTokens: r.completion_tokens ?? null,
        totalTokens: r.total_tokens ?? null,
      },
      createdAt: r.created_at,
    }));
  }
}
