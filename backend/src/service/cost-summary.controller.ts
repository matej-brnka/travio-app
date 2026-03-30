import { Controller, Get, Query } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('service')
export class CostSummaryController {
  constructor(private supabase: SupabaseService) {}

  @Get('costs')
  async costs(@Query('days') daysParam?: string) {
    const days = Math.min(Math.max(parseInt(daysParam ?? '30', 10) || 30, 1), 365);

    const [llmRows, gpRows] = await Promise.all([
      this.supabase.query<any>(
        `SELECT
           DATE(created_at AT TIME ZONE 'UTC') AS date,
           model,
           COUNT(*)::int                        AS calls,
           COALESCE(SUM(prompt_tokens),     0)::int AS prompt_tokens,
           COALESCE(SUM(completion_tokens), 0)::int AS completion_tokens
         FROM llm_calls
         WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
         GROUP BY date, model
         ORDER BY date ASC`,
        [days],
      ),
      this.supabase.query<any>(
        `SELECT
           DATE(created_at AT TIME ZONE 'UTC') AS date,
           api_type,
           COUNT(*)::int AS calls
         FROM google_places_calls
         WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
         GROUP BY date, api_type
         ORDER BY date ASC`,
        [days],
      ),
    ]);

    return {
      days,
      llm: llmRows.map((r) => ({
        date: r.date,
        model: r.model,
        calls: r.calls,
        promptTokens: r.prompt_tokens,
        completionTokens: r.completion_tokens,
      })),
      googlePlaces: gpRows.map((r) => ({
        date: r.date,
        apiType: r.api_type,
        calls: r.calls,
      })),
    };
  }
}
