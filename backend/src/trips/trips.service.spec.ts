import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TripsService } from './trips.service';

const mockQuery = jest.fn();
const mockSupabase = { query: mockQuery } as any;
const mockConfig = { get: () => 'http://localhost:5173', getOrThrow: () => '' } as any;

const USER_ID = 'user-1';
const TRIP_ID = 'trip-1';

const dbTrip = {
  id: TRIP_ID, name: 'Paris', emoji: '🗼',
  date_from: '2026-05-01', date_to: '2026-05-03',
  interests: [], share_token: null,
  created_at: '2026-01-01', updated_at: '2026-01-01',
};

describe('TripsService', () => {
  let service: TripsService;

  beforeEach(() => {
    mockQuery.mockReset();
    service = new TripsService(mockSupabase, mockConfig);
  });

  describe('findAll', () => {
    it('returns formatted trips', async () => {
      mockQuery.mockResolvedValueOnce([dbTrip]);
      const result = await service.findAll(USER_ID);
      expect(result).toHaveLength(1);
      expect(result[0].dateFrom).toBe('2026-05-01');
    });
  });

  describe('findOne', () => {
    it('throws 404 when trip not found', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await expect(service.findOne(TRIP_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns nested structure with days and unassigned', async () => {
      mockQuery
        .mockResolvedValueOnce([dbTrip])
        .mockResolvedValueOnce([{ id: 'd1', date: '2026-05-01', position: 0 }])
        .mockResolvedValueOnce([]);
      const result = await service.findOne(TRIP_ID, USER_ID);
      expect(result.days).toHaveLength(1);
      expect(result.unassigned).toEqual([]);
    });
  });

  describe('create', () => {
    it('throws 400 when required fields missing', async () => {
      await expect(service.create(USER_ID, { name: '', emoji: '', dateFrom: '', dateTo: '' }))
        .rejects.toThrow(BadRequestException);
    });

    it('creates trip and days for date range', async () => {
      mockQuery
        .mockResolvedValueOnce([dbTrip])
        .mockResolvedValue([]);
      const result = await service.create(USER_ID, {
        name: 'Paris', emoji: '🗼', dateFrom: '2026-05-01', dateTo: '2026-05-03',
      });
      expect(result.name).toBe('Paris');
      // INSERT trip + 3 days = 4 calls
      expect(mockQuery).toHaveBeenCalledTimes(4);
    });
  });

  describe('remove', () => {
    it('throws 404 when trip not found', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await expect(service.remove(TRIP_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns deleted: true on success', async () => {
      mockQuery.mockResolvedValueOnce([{ id: TRIP_ID }]);
      const result = await service.remove(TRIP_ID, USER_ID);
      expect(result).toEqual({ deleted: true });
    });
  });
});
