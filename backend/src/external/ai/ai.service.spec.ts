import { ServiceUnavailableException } from '@nestjs/common';
import { AiService } from './ai.service';

const mockConfig = (key?: string) =>
  ({ get: (k: string) => (k === 'OPENAI_API_KEY' ? key : 'gpt-4o-mini') }) as any;

describe('AiService', () => {
  afterEach(() => { (global as any).fetch = undefined; });

  it('throws 503 when API key not configured', async () => {
    const service = new AiService(mockConfig(undefined));
    await expect(service.generateItinerary({ destination: 'Paris', dateFrom: '2026-05-01', dateTo: '2026-05-03', interests: [] }))
      .rejects.toThrow(ServiceUnavailableException);
  });

  it('returns [] when fetch fails', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('network'));
    const service = new AiService(mockConfig('key'));
    const result = await service.generateItinerary({ destination: 'Paris', dateFrom: '2026-05-01', dateTo: '2026-05-03', interests: [] });
    expect(result).toEqual([]);
  });

  it('returns [] on invalid JSON from OpenAI', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'not json {{{' } }] }),
    });
    const service = new AiService(mockConfig('key'));
    const result = await service.generateItinerary({ destination: 'Paris', dateFrom: '2026-05-01', dateTo: '2026-05-03', interests: [] });
    expect(result).toEqual([]);
  });

  it('maps OpenAI response to AiPlace array', async () => {
    const places = [{ name: 'Eiffel Tower', dayIndex: 0, emoji: '🗼', note: 'Must see', priority: 'must-see' }];
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: JSON.stringify({ places }) } }] }),
    });
    const service = new AiService(mockConfig('key'));
    const result = await service.generateItinerary({ destination: 'Paris', dateFrom: '2026-05-01', dateTo: '2026-05-01', interests: ['art'] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Eiffel Tower');
  });
});
