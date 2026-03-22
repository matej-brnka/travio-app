import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { subYears, format, parseISO, differenceInDays } from 'date-fns';

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

// WMO weather code → emoji (Open-Meteo historical)
function wmoIcon(code: number): string {
  if (code === 0)                       return '☀️';
  if (code === 1)                       return '🌤️';
  if (code === 2)                       return '⛅';
  if (code === 3)                       return '☁️';
  if (code === 45 || code === 48)       return '🌫️';
  if (code >= 51 && code <= 57)         return '🌦️';
  if (code >= 61 && code <= 67)         return '🌧️';
  if (code >= 71 && code <= 77)         return '❄️';
  if (code >= 80 && code <= 82)         return '🌦️';
  if (code === 85 || code === 86)       return '❄️';
  if (code >= 95)                       return '⛈️';
  return '🌡️';
}

interface DayWeather { date: string; temp: number | null; tempMin: number | null; icon: string | null; }
export interface TripWeatherResult {
  summary: { temp: number | null; icon: string | null; type: 'forecast' | 'historical' };
  days: DayWeather[];
}

interface CacheEntry { data: any; expiresAt: number; }

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly userAgent: string;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly TTL = 60 * 60 * 1000; // 1 hour

  constructor(private config: ConfigService) {
    this.userAgent = config.get('YR_NO_USER_AGENT') ?? 'travio/1.0 contact@example.com';
  }

  // Legacy single-day endpoint (kept for backwards compat)
  async getWeather(lat: number, lng: number, date: string): Promise<any> {
    const cacheKey = `single:${lat},${lng},${date}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    try {
      const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'User-Agent': this.userAgent } });
      if (!res.ok) return { temp: null, icon: null, description: null };
      const data: any = await res.json();
      const result = this.extractForDate(data, date);
      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.TTL });
      return result;
    } catch (err: any) {
      this.logger.error('Weather fetch failed', err.message);
      return { temp: null, icon: null, description: null };
    }
  }

  // New: smart trip-level weather
  async getTripWeather(lat: number, lng: number, dateFrom: string, dateTo: string): Promise<TripWeatherResult> {
    const cacheKey = `trip:${lat},${lng},${dateFrom},${dateTo}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilTrip = differenceInDays(parseISO(dateFrom), today);

    const result = daysUntilTrip <= 9
      ? await this.getForecastWeather(lat, lng, dateFrom, dateTo)
      : await this.getHistoricalWeather(lat, lng, dateFrom, dateTo);

    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.TTL });
    return result;
  }

  // ── Forecast via yr.no ──────────────────────────────────────────────────────
  private async getForecastWeather(lat: number, lng: number, dateFrom: string, dateTo: string): Promise<TripWeatherResult> {
    try {
      const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'User-Agent': this.userAgent } });
      if (!res.ok) throw new Error(`yr.no ${res.status}`);
      const data: any = await res.json();

      let days = this.eachDay(dateFrom, dateTo).map(date => this.extractForDate(data, date, date));

      // Fill in days beyond the forecast window using historical data
      const missingDates = days.filter(d => d.temp === null).map(d => d.date);
      if (missingDates.length > 0) {
        const histResult = await this.getHistoricalWeather(lat, lng, dateFrom, dateTo).catch(() => null);
        if (histResult) {
          const histMap = new Map<string, DayWeather>(histResult.days.map(d => [d.date, d]));
          days = days.map(d => (d.temp === null && histMap.has(d.date)) ? histMap.get(d.date)! : d);
        }
      }

      const summary = this.summarize(days, 'forecast');
      return { summary, days };
    } catch (err: any) {
      this.logger.warn('Forecast fetch failed, falling back to historical', err.message);
      return this.getHistoricalWeather(lat, lng, dateFrom, dateTo);
    }
  }

  // ── Historical via Open-Meteo archive (same period last year) ──────────────
  private async getHistoricalWeather(lat: number, lng: number, dateFrom: string, dateTo: string): Promise<TripWeatherResult> {
    try {
      const histFrom = format(subYears(parseISO(dateFrom), 1), 'yyyy-MM-dd');
      const histTo   = format(subYears(parseISO(dateTo),   1), 'yyyy-MM-dd');

      const url = `https://archive-api.open-meteo.com/v1/archive`
        + `?latitude=${lat}&longitude=${lng}`
        + `&start_date=${histFrom}&end_date=${histTo}`
        + `&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`open-meteo ${res.status}`);
      const data: any = await res.json();

      const temps: number[] = data?.daily?.temperature_2m_max ?? [];
      const tempsMin: number[] = data?.daily?.temperature_2m_min ?? [];
      const codes: number[] = data?.daily?.weathercode ?? [];

      // Map historical dates back to trip dates
      const tripDates = this.eachDay(dateFrom, dateTo);
      const days: DayWeather[] = tripDates.map((tripDate, i) => ({
        date: tripDate,
        temp: temps[i] != null ? Math.round(temps[i]) : null,
        tempMin: tempsMin[i] != null ? Math.round(tempsMin[i]) : null,
        icon: codes[i] != null ? wmoIcon(codes[i]) : null,
      }));

      const summary = this.summarize(days, 'historical');
      return { summary, days };
    } catch (err: any) {
      this.logger.error('Historical weather fetch failed', err.message);
      const tripDates = this.eachDay(dateFrom, dateTo);
      return {
        summary: { temp: null, icon: null, type: 'historical' },
        days: tripDates.map(date => ({ date, temp: null, tempMin: null, icon: null })),
      };
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private eachDay(dateFrom: string, dateTo: string): string[] {
    const dates: string[] = [];
    let current = parseISO(dateFrom);
    const end = parseISO(dateTo);
    while (current <= end) {
      dates.push(format(current, 'yyyy-MM-dd'));
      current = new Date(current.getTime() + 86_400_000);
    }
    return dates;
  }

  private summarize(days: DayWeather[], type: 'forecast' | 'historical'): { temp: number | null; icon: string | null; type: 'forecast' | 'historical' } {
    const temps = days.map(d => d.temp).filter((t): t is number => t != null);
    const avg = temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null;
    // Pick most common icon
    const iconCounts: Record<string, number> = {};
    for (const d of days) {
      if (d.icon) iconCounts[d.icon] = (iconCounts[d.icon] ?? 0) + 1;
    }
    const icon = Object.entries(iconCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { temp: avg, icon, type };
  }

  private extractForDate(data: any, date: string, returnDate?: string): DayWeather {
    const timeseries: any[] = data?.properties?.timeseries ?? [];

    // Daytime entries: 06:00 – 20:00
    const daytime = timeseries.filter((t: any) => {
      if (!t.time?.startsWith(date)) return false;
      const hour = parseInt(t.time.slice(11, 13), 10);
      return hour >= 6 && hour <= 20;
    });

    const entries = daytime.length > 0
      ? daytime
      : timeseries.filter((t: any) => t.time?.startsWith(date)); // fallback: all entries

    if (!entries.length) return { date: returnDate ?? date, temp: null, tempMin: null, icon: null };

    // Max and min temperature across daytime entries
    const temps = entries
      .map((e: any) => e.data?.instant?.details?.air_temperature)
      .filter((v: any) => v != null) as number[];
    const temp    = temps.length ? Math.round(Math.max(...temps)) : null;
    const tempMin = temps.length ? Math.round(Math.min(...temps)) : null;

    // Most common symbol code
    const symbolCounts: Record<string, number> = {};
    for (const e of entries) {
      const code = (
        e.data?.next_1_hours?.summary?.symbol_code ??
        e.data?.next_6_hours?.summary?.symbol_code ??
        ''
      ).replace(/_day|_night|_polartwilight/, '');
      if (code) symbolCounts[code] = (symbolCounts[code] ?? 0) + 1;
    }
    const symbolCode = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    const mapped = SYMBOL_MAP[symbolCode] ?? { icon: '🌡️' };

    return { date: returnDate ?? date, temp, tempMin, icon: mapped.icon };
  }
}
