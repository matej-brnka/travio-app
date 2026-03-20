import { Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BASE = 'https://maps.googleapis.com/maps/api/place';

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly apiKey: string | undefined;

  constructor(private config: ConfigService) {
    this.apiKey = config.get<string>('GOOGLE_PLACES_API_KEY');
  }

  async search(query: string): Promise<any[]> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Google Places API key is not configured');
    }
    if (!query?.trim()) return [];

    try {
      const searchUrl = `${BASE}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}&language=cs`;
      const searchRes = await fetch(searchUrl);
      const searchData: any = await searchRes.json();

      if (searchData.status === 'ZERO_RESULTS' || !searchData.results?.length) return [];

      const top5 = searchData.results.slice(0, 5);

      const results = await Promise.all(
        top5.map(async (r: any) => {
          try {
            const detailUrl = `${BASE}/details/json?place_id=${r.place_id}&fields=name,formatted_address,geometry,website,opening_hours,place_id&key=${this.apiKey}&language=cs`;
            const detailRes = await fetch(detailUrl);
            const detailData: any = await detailRes.json();
            const d = detailData.result ?? r;

            return {
              googlePlaceId: r.place_id,
              name: d.name ?? r.name,
              address: d.formatted_address ?? r.formatted_address ?? null,
              lat: d.geometry?.location?.lat ?? r.geometry?.location?.lat ?? null,
              lng: d.geometry?.location?.lng ?? r.geometry?.location?.lng ?? null,
              website: d.website ?? null,
              openingHours: d.opening_hours?.weekday_text ?? null,
            };
          } catch {
            return {
              googlePlaceId: r.place_id,
              name: r.name,
              address: r.formatted_address ?? null,
              lat: r.geometry?.location?.lat ?? null,
              lng: r.geometry?.location?.lng ?? null,
              website: null,
              openingHours: null,
            };
          }
        }),
      );

      return results;
    } catch (err: any) {
      this.logger.error('Google Places search failed', err.message);
      return [];
    }
  }
}
