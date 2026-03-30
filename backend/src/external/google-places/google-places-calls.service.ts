import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export type GooglePlacesApi = 'places' | 'maps';
export type GooglePlacesApiType = 'text_search' | 'place_details' | 'place_photo';

export interface GooglePlacesCallRecord {
  id: number;
  api: GooglePlacesApi;
  apiType: GooglePlacesApiType;
  query: string | null;
  placeId: string | null;
  resultCount: number | null;
  createdAt: string;
}

@Injectable()
export class GooglePlacesCallsService {
  private readonly logger = new Logger(GooglePlacesCallsService.name);

  constructor(private supabase: SupabaseService) {}

  async logCall(data: {
    api: GooglePlacesApi;
    apiType: GooglePlacesApiType;
    query?: string;
    placeId?: string;
    resultCount?: number;
  }): Promise<void> {
    try {
      await this.supabase.query(
        `INSERT INTO google_places_calls (api, api_type, query, place_id, result_count)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.api, data.apiType, data.query ?? null, data.placeId ?? null, data.resultCount ?? null],
      );
    } catch (err: any) {
      this.logger.warn(`Failed to save Google Places call to DB: ${err?.message ?? err}`);
    }
  }

  async listCalls(limit = 100): Promise<GooglePlacesCallRecord[]> {
    const safeLimit = Math.max(1, Math.min(limit, 500));
    const rows = await this.supabase.query<any>(
      `SELECT id, api, api_type, query, place_id, result_count, created_at
       FROM google_places_calls
       ORDER BY created_at DESC
       LIMIT $1`,
      [safeLimit],
    );
    return rows.map((r) => ({
      id: r.id,
      api: r.api,
      apiType: r.api_type,
      query: r.query ?? null,
      placeId: r.place_id ?? null,
      resultCount: r.result_count ?? null,
      createdAt: r.created_at,
    }));
  }
}
