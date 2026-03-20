import { WeatherService } from './weather.service';

const mockConfig = { get: () => 'travio/1.0 test@test.com' } as any;

const makeTimeseries = (date: string, hour: string, temp: number, symbol: string) => ({
  time: `${date}T${hour}:00:00Z`,
  data: {
    instant: { details: { air_temperature: temp } },
    next_6_hours: { summary: { symbol_code: symbol } },
  },
});

const mockYrResponse = (date: string) => ({
  properties: {
    timeseries: [
      makeTimeseries(date, '06', 10, 'clearsky_day'),
      makeTimeseries(date, '12', 14, 'partlycloudy_day'),
      makeTimeseries(date, '18', 11, 'rain'),
    ],
  },
});

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(() => {
    (global as any).fetch = undefined;
    service = new WeatherService(mockConfig);
  });

  it('returns null fields when fetch fails', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('network error'));
    const result = await service.getWeather(50, 14, '2026-07-10');
    expect(result).toEqual({ temp: null, icon: null, description: null });
  });

  it('returns null fields when yr.no responds with non-ok status', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });
    const result = await service.getWeather(50, 14, '2026-07-10');
    expect(result).toEqual({ temp: null, icon: null, description: null });
  });

  it('maps symbol_code to emoji and returns noon temp', async () => {
    const date = '2026-07-10';
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockYrResponse(date)),
    });
    const result = await service.getWeather(48.85, 2.35, date);
    expect(result.temp).toBe(14);
    expect(result.icon).toBe('⛅');
    expect(result.description).toBe('Partly cloudy');
  });

  it('caches results and does not call fetch a second time', async () => {
    const date = '2026-07-10';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockYrResponse(date)),
    });
    (global as any).fetch = fetchMock;

    await service.getWeather(48.85, 2.35, date);
    await service.getWeather(48.85, 2.35, date);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
