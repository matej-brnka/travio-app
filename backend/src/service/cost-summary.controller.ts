import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('service')
export class CostSummaryController {
  constructor(private supabase: SupabaseService) {}

  @Post('telemetry')
  @UseGuards(JwtAuthGuard)
  async telemetry(
    @Body() body: { event: string; metadata?: Record<string, any> },
    @CurrentUser() user: { userId: string; email?: string },
  ) {
    const EVENT_MAP: Record<string, { api: string; apiType: string }> = {
      map_load: { api: 'maps', apiType: 'map_load' },
      place_details_pro_client: { api: 'places', apiType: 'place_details_pro' },
    };
    const mapped = EVENT_MAP[body?.event];
    if (!mapped) return { ok: false };
    try {
      await this.supabase.query(
        `INSERT INTO google_places_calls (user_id, user_email, api, api_type) VALUES ($1, $2, $3, $4)`,
        [user.userId, user.email ?? null, mapped.api, mapped.apiType],
      );
    } catch {
      // fire-and-forget – never break the client
    }
    return { ok: true };
  }

  @Get('costs')
  @UseGuards(JwtAuthGuard, AdminGuard)
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
           api,
           api_type,
           COUNT(*)::int AS calls
         FROM google_places_calls
         WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
         GROUP BY date, api, api_type
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
        api: r.api,
        apiType: r.api_type,
        calls: r.calls,
      })),
    };
  }
}
