import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PlacesService } from './places.service';

const mockQuery = jest.fn();
const mockSupabase = { query: mockQuery } as any;

const USER_ID = 'user-1';
const TRIP_ID = 'trip-1';
const PLACE_ID = 'place-1';
const DAY_ID = 'day-1';

const dbPlace = {
  id: PLACE_ID, trip_id: TRIP_ID, day_id: DAY_ID,
  name: 'Eiffel Tower', emoji: '🗼', address: null, website: null,
  lat: null, lng: null, opening_hours: null, ticket: null,
  visited: false, note: null, priority: null,
  time_from: null, time_to: null, position: 0, google_place_id: null,
};

describe('PlacesService', () => {
  let service: PlacesService;

  beforeEach(() => {
    mockQuery.mockReset();
    service = new PlacesService(mockSupabase);
  });

  describe('move', () => {
    it('throws 404 when trip not owned', async () => {
      mockQuery.mockResolvedValueOnce([]); // assertOwner
      await expect(service.move(TRIP_ID, PLACE_ID, USER_ID, { targetDayId: null }))
        .rejects.toThrow(NotFoundException);
    });

    it('throws 404 when place not found', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }]) // assertOwner
        .mockResolvedValueOnce([]);               // assertPlace
      await expect(service.move(TRIP_ID, PLACE_ID, USER_ID, { targetDayId: null }))
        .rejects.toThrow(NotFoundException);
    });

    it('moves place to unassigned (targetDayId: null)', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }])    // assertOwner
        .mockResolvedValueOnce([{ id: PLACE_ID }])   // assertPlace
        .mockResolvedValueOnce([{ cnt: '2' }])        // count in target
        .mockResolvedValueOnce([{ ...dbPlace, day_id: null, position: 2 }]); // update
      const result = await service.move(TRIP_ID, PLACE_ID, USER_ID, { targetDayId: null });
      expect(result.dayId).toBeNull();
      expect(result.position).toBe(2);
    });

    it('moves place to a specific day', async () => {
      const TARGET_DAY = 'day-2';
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }])
        .mockResolvedValueOnce([{ id: PLACE_ID }])
        .mockResolvedValueOnce([{ cnt: '1' }])
        .mockResolvedValueOnce([{ ...dbPlace, day_id: TARGET_DAY, position: 1 }]);
      const result = await service.move(TRIP_ID, PLACE_ID, USER_ID, { targetDayId: TARGET_DAY });
      expect(result.dayId).toBe(TARGET_DAY);
    });
  });

  describe('reorder', () => {
    it('throws 404 when trip not owned', async () => {
      mockQuery.mockResolvedValueOnce([]);
      await expect(service.reorder(TRIP_ID, DAY_ID, USER_ID, { placeIds: ['p1', 'p2'] }))
        .rejects.toThrow(NotFoundException);
    });

    it('updates position for each placeId', async () => {
      mockQuery.mockResolvedValue([{ id: TRIP_ID }]);
      const result = await service.reorder(TRIP_ID, DAY_ID, USER_ID, { placeIds: ['p1', 'p2', 'p3'] });
      expect(result).toEqual({ reordered: true });
      // assertOwner + 3 updates = 4 calls
      expect(mockQuery).toHaveBeenCalledTimes(4);
    });
  });

  describe('remove', () => {
    it('throws 404 when place not found', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }]) // assertOwner
        .mockResolvedValueOnce([]);               // delete returns nothing
      await expect(service.remove(TRIP_ID, PLACE_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns deleted: true', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: TRIP_ID }])
        .mockResolvedValueOnce([{ id: PLACE_ID }]);
      const result = await service.remove(TRIP_ID, PLACE_ID, USER_ID);
      expect(result).toEqual({ deleted: true });
    });
  });
});
