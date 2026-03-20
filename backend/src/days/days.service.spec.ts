import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DaysService } from './days.service';

const mockQuery = jest.fn();
const mockSupabase = { query: mockQuery } as any;

const USER_ID = 'user-1';
const TRIP_ID = 'trip-1';
const DAY_ID = 'day-1';

describe('DaysService', () => {
  let service: DaysService;

  beforeEach(() => {
    mockQuery.mockReset();
    service = new DaysService(mockSupabase);
  });

  describe('addDay', () => {
    it('throws 404 when trip not owned', async () => {
      mockQuery.mockResolvedValueOnce([]); // assertOwner
      await expect(service.addDay(TRIP_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('adds a day with date = last + 1', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }])           // assertOwner
        .mockResolvedValueOnce([{ date: '2026-05-03' }])    // last date
        .mockResolvedValueOnce([{ cnt: '3' }])              // count
        .mockResolvedValueOnce([{ id: DAY_ID, date: '2026-05-04', position: 3 }]) // insert
        .mockResolvedValueOnce([]);                          // update trip date_to

      const result = await service.addDay(TRIP_ID, USER_ID);
      expect(result.date).toBe('2026-05-04');
    });
  });

  describe('removeDay', () => {
    it('throws 400 when deleting last day', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }]) // assertOwner
        .mockResolvedValueOnce([{ cnt: '1' }]);   // count
      await expect(service.removeDay(TRIP_ID, DAY_ID, USER_ID)).rejects.toThrow(BadRequestException);
    });

    it('throws 404 when day not found', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }]) // assertOwner
        .mockResolvedValueOnce([{ cnt: '3' }])    // count
        .mockResolvedValueOnce([]);               // day lookup
      await expect(service.removeDay(TRIP_ID, DAY_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('deletes day and returns deleted: true', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }])           // assertOwner
        .mockResolvedValueOnce([{ cnt: '3' }])              // count
        .mockResolvedValueOnce([{ id: DAY_ID }])            // day lookup
        .mockResolvedValueOnce([])                          // update places
        .mockResolvedValueOnce([])                          // delete day
        .mockResolvedValueOnce([{ date: '2026-05-02' }])   // last day
        .mockResolvedValueOnce([]);                         // update trip date_to

      const result = await service.removeDay(TRIP_ID, DAY_ID, USER_ID);
      expect(result).toEqual({ deleted: true });
    });
  });
});
