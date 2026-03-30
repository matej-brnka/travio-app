import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export type GooglePlacesApi = 'places' | 'maps';
export type GooglePlacesApiType =
  | 'text_search_pro'
  | 'text_search'
  | 'place_details_pro'
  | 'place_details_essentials'
  | 'place_details'
  | 'place_photo'
  | 'map_load';

export interface GooglePlacesCallRecord {
  id: number;
  userId: string | null;
  userEmail: string | null;
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
    userId?: string;
    userEmail?: string;
    api: GooglePlacesApi;
    apiType: GooglePlacesApiType;
    query?: string;
    placeId?: string;
    resultCount?: number;
  }): Promise<void> {
    try {
      await this.supabase.query(
        `INSERT INTO google_places_calls (user_id, user_email, api, api_type, query, place_id, result_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          data.userId ?? null,
          data.userEmail ?? null,
          data.api,
          data.apiType,
          data.query ?? null,
          data.placeId ?? null,
          data.resultCount ?? null,
        ],
      );
    } catch (err: any) {
      this.logger.warn(`Failed to save Google Places call to DB: ${err?.message ?? err}`);
    }
  }

  async listCalls(limit = 100): Promise<GooglePlacesCallRecord[]> {
    const safeLimit = Math.max(1, Math.min(limit, 500));
    const rows = await this.supabase.query<any>(
      `SELECT id, user_id, user_email, api, api_type, query, place_id, result_count, created_at
       FROM google_places_calls
       ORDER BY created_at DESC
       LIMIT $1`,
      [safeLimit],
    );
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id ?? null,
      userEmail: r.user_email ?? null,
      api: r.api,
      apiType: r.api_type,
      query: r.query ?? null,
      placeId: r.place_id ?? null,
      resultCount: r.result_count ?? null,
      createdAt: r.created_at,
    }));
  }
}
