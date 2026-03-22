import { Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BASE = 'https://maps.googleapis.com/maps/api/place';

const DESTINATION_TYPES = ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'country', 'sublocality', 'natural_feature', 'neighborhood', 'colloquial_area'];

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly apiKey: string | undefined;

  constructor(private config: ConfigService) {
    this.apiKey = config.get<string>('GOOGLE_PLACES_API_KEY');
  }

  async searchDestinations(query: string): Promise<any[]> {
    if (!this.apiKey) throw new ServiceUnavailableException('Google Places API key is not configured');
    if (!query?.trim()) return [];
    try {
      const url = `${BASE}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}&language=cs`;
      const res = await fetch(url);
      const data: any = await res.json();
      if (data.status === 'ZERO_RESULTS' || !data.results?.length) return [];
      return data.results
        .filter((r: any) => r.types?.some((t: string) => DESTINATION_TYPES.includes(t)))
        .slice(0, 6)
        .map((r: any) => ({
          name: r.name,
          description: r.formatted_address,
          placeId: r.place_id,
          lat: r.geometry?.location?.lat ?? null,
          lng: r.geometry?.location?.lng ?? null,
          viewport: r.geometry?.viewport
            ? {
                north: r.geometry.viewport.northeast.lat,
                south: r.geometry.viewport.southwest.lat,
                east: r.geometry.viewport.northeast.lng,
                west: r.geometry.viewport.southwest.lng,
              }
            : null,
        }));
    } catch (err: any) {
      this.logger.error('Destination search failed', err.message);
      return [];
    }
  }

  async getPhoto(googlePlaceId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    if (!this.apiKey) return null;
    try {
      // 1. Fetch photo reference from Place Details
      const detailUrl = `${BASE}/details/json?place_id=${googlePlaceId}&fields=photos&key=${this.apiKey}`;
      const detailRes = await fetch(detailUrl);
      const detailData: any = await detailRes.json();
      this.logger.debug(`getPhoto details status=${detailData?.status} photos=${detailData?.result?.photos?.length ?? 0} placeId=${googlePlaceId}`);
      const photoRef = detailData?.result?.photos?.[0]?.photo_reference;
      if (!photoRef) {
        this.logger.warn(`getPhoto: no photo_reference for placeId=${googlePlaceId} status=${detailData?.status}`);
        return null;
      }

      // 2. Fetch the photo (Google returns a redirect; fetch follows it automatically)
      const photoUrl = `${BASE}/photo?maxwidth=800&photo_reference=${photoRef}&key=${this.apiKey}`;
      const photoRes = await fetch(photoUrl);
      this.logger.debug(`getPhoto photo fetch status=${photoRes.status} contentType=${photoRes.headers.get('content-type')}`);
      if (!photoRes.ok) return null;
      const contentType = photoRes.headers.get('content-type') ?? 'image/jpeg';
      const buffer = Buffer.from(await photoRes.arrayBuffer());
      return { buffer, contentType };
    } catch (err: any) {
      this.logger.error('getPhoto failed', err.message);
      return null;
    }
  }

  async search(query: string, centerLat?: number, centerLng?: number): Promise<any[]> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Google Places API key is not configured');
    }
    if (!query?.trim()) return [];

    try {
      let searchUrl = `${BASE}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}&language=cs`;
      if (centerLat != null && centerLng != null) {
        searchUrl += `&location=${centerLat},${centerLng}&radius=50000`;
      }
      const searchRes = await fetch(searchUrl);
      const searchData: any = await searchRes.json();

      if (searchData.status === 'ZERO_RESULTS' || !searchData.results?.length) return [];

      const results = await Promise.all(
        searchData.results.slice(0, 5).map(async (r: any) => {
          try {
            const detailUrl = `${BASE}/details/json?place_id=${r.place_id}&fields=name,formatted_address,geometry,website,opening_hours,place_id&key=${this.apiKey}&language=cs`;
            const detailData: any = await (await fetch(detailUrl)).json();
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
