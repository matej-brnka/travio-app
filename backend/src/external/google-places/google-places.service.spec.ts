import { ServiceUnavailableException } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';

const mockConfig = (key?: string) =>
  ({ get: () => key }) as any;

const mockCalls = { logCall: jest.fn().mockResolvedValue(undefined) } as any;

const mockFetch = (responses: any[]) => {
  let i = 0;
  return jest.fn().mockImplementation(() =>
    Promise.resolve({ json: () => Promise.resolve(responses[i++]) }),
  );
};

describe('GooglePlacesService', () => {
  afterEach(() => {
    (global as any).fetch = undefined;
  });

  it('throws 503 when API key not configured', async () => {
    const service = new GooglePlacesService(mockConfig(undefined), mockCalls);
    await expect(service.search('paris')).rejects.toThrow(ServiceUnavailableException);
  });

  it('returns [] for empty query', async () => {
    const service = new GooglePlacesService(mockConfig('test-key'), mockCalls);
    expect(await service.search('')).toEqual([]);
    expect(await service.search('   ')).toEqual([]);
  });

  it('returns [] when ZERO_RESULTS', async () => {
    (global as any).fetch = mockFetch([{ status: 'ZERO_RESULTS', results: [] }]);
    const service = new GooglePlacesService(mockConfig('test-key'), mockCalls);
    expect(await service.search('xyznotfound')).toEqual([]);
  });

  it('maps results to Place-compatible format', async () => {
    (global as any).fetch = mockFetch([
      {
        status: 'OK',
        results: [
          { place_id: 'ChIJ1', name: 'Eiffel Tower', formatted_address: 'Paris', geometry: { location: { lat: 48.8, lng: 2.3 } } },
        ],
      },
      {
        result: {
          name: 'Eiffel Tower', formatted_address: 'Champ de Mars, Paris',
          geometry: { location: { lat: 48.8584, lng: 2.2945 } },
          website: 'https://toureiffel.paris', opening_hours: { weekday_text: ['Mo: 9–23'] },
          place_id: 'ChIJ1',
        },
      },
    ]);
    const service = new GooglePlacesService(mockConfig('test-key'), mockCalls);
    const results = await service.search('eiffel');
    expect(results).toHaveLength(1);
    expect(results[0].googlePlaceId).toBe('ChIJ1');
    expect(results[0].website).toBe('https://toureiffel.paris');
    expect(results[0].openingHours).toEqual(['Mo: 9–23']);
  });
});
