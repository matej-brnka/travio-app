import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SYMBOL_MAP: Record<string, { icon: string; description: string }> = {
  clearsky:           { icon: '☀️',  description: 'Clear sky' },
  fair:               { icon: '🌤️', description: 'Fair' },
  partlycloudy:       { icon: '⛅',  description: 'Partly cloudy' },
  cloudy:             { icon: '☁️',  description: 'Cloudy' },
  fog:                { icon: '🌫️', description: 'Fog' },
  lightrain:          { icon: '🌦️', description: 'Light rain' },
  rain:               { icon: '🌧️', description: 'Rain' },
  heavyrain:          { icon: '🌧️', description: 'Heavy rain' },
  lightsleet:         { icon: '🌨️', description: 'Light sleet' },
  sleet:              { icon: '🌨️', description: 'Sleet' },
  lightsnow:          { icon: '❄️',  description: 'Light snow' },
  snow:               { icon: '❄️',  description: 'Snow' },
  heavysnow:          { icon: '❄️',  description: 'Heavy snow' },
  thunder:            { icon: '⛈️',  description: 'Thunder' },
  rainandthunder:     { icon: '⛈️',  description: 'Rain and thunder' },
  snowandthunder:     { icon: '⛈️',  description: 'Snow and thunder' },
};

interface CacheEntry {
  data: any;
  expiresAt: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly userAgent: string;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly TTL = 60 * 60 * 1000; // 1 hour

  constructor(private config: ConfigService) {
    this.userAgent = config.get('YR_NO_USER_AGENT') ?? 'travio/1.0 contact@example.com';
  }

  async getWeather(lat: number, lng: number, date: string): Promise<any> {
    const cacheKey = `${lat},${lng},${date}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    try {
      const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });

      if (!res.ok) {
        this.logger.warn(`yr.no responded with ${res.status}`);
        return { temp: null, icon: null, description: null };
      }

      const data: any = await res.json();
      const result = this.extractForDate(data, date);

      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.TTL });
      return result;
    } catch (err: any) {
      this.logger.error('Weather fetch failed', err.message);
      return { temp: null, icon: null, description: null };
    }
  }

  private extractForDate(data: any, date: string): any {
    const timeseries: any[] = data?.properties?.timeseries ?? [];

    // Find entry closest to noon on the requested date
    const candidates = timeseries.filter((t: any) => t.time?.startsWith(date));
    const entry = candidates.find((t: any) => t.time?.includes('T12:')) ?? candidates[0] ?? timeseries[0];

    if (!entry) return { temp: null, icon: null, description: null };

    const temp = Math.round(entry.data?.instant?.details?.air_temperature ?? null);
    const symbolCode: string = (
      entry.data?.next_6_hours?.summary?.symbol_code ??
      entry.data?.next_1_hours?.summary?.symbol_code ??
      ''
    ).replace(/_day|_night|_polartwilight/, '');

    const mapped = SYMBOL_MAP[symbolCode] ?? { icon: '🌡️', description: symbolCode };
    return { temp, icon: mapped.icon, description: mapped.description };
  }
}
