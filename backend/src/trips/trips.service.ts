import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import type { AiService } from '../external/ai/ai.service';
import type { PlacesService } from '../places/places.service';

@Injectable()
export class TripsService {
  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
    @Optional() private ai?: AiService,
    @Optional() private places?: PlacesService,
  ) {}

  async findAll(userId: string) {
    const rows = await this.supabase.query(
      `SELECT id, name, title, emoji, date_from, date_to, interests, share_token, center_lat, center_lng, destinations, created_at, updated_at
       FROM trips WHERE user_id = $1 ORDER BY date_from ASC`,
      [userId],
    );
    return rows.map(this.formatTrip);
  }

  async findOne(tripId: string, userId: string) {
    const trips = await this.supabase.query(
      `SELECT id, name, title, emoji, date_from, date_to, interests, share_token, center_lat, center_lng, destinations
       FROM trips WHERE id = $1 AND user_id = $2`,
      [tripId, userId],
    );
    if (!trips.length) throw new NotFoundException('Trip not found');

    const days = await this.supabase.query(
      `SELECT id, date, position, destination_index FROM days WHERE trip_id = $1 ORDER BY position`,
      [tripId],
    );

    const places = await this.supabase.query(
      `SELECT * FROM places WHERE trip_id = $1 ORDER BY position`,
      [tripId],
    );

    const placesMap = new Map<string | null, any[]>();
    for (const p of places) {
      const key = p.day_id ?? null;
      if (!placesMap.has(key)) placesMap.set(key, []);
      placesMap.get(key)!.push(this.formatPlace(p));
    }

    return {
      ...this.formatTrip(trips[0]),
      days: days.map((d) => ({
        id: d.id,
        date: d.date,
        position: d.position,
        destinationIndex: d.destination_index ?? 0,
        places: placesMap.get(d.id) ?? [],
      })),
      unassigned: placesMap.get(null) ?? [],
    };
  }

  async create(userId: string, dto: CreateTripDto) {
    if (!dto.name || !dto.emoji || !dto.dateFrom || !dto.dateTo) {
      throw new BadRequestException('name, emoji, dateFrom, dateTo are required');
    }

    const trips = await this.supabase.query(
      `INSERT INTO trips (user_id, name, title, emoji, date_from, date_to, interests, center_lat, center_lng, destinations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
       RETURNING id, name, title, emoji, date_from, date_to, interests, share_token, center_lat, center_lng, destinations, created_at, updated_at`,
      [userId, dto.name, dto.title ?? null, dto.emoji, dto.dateFrom, dto.dateTo, dto.interests ?? null, dto.centerLat ?? null, dto.centerLng ?? null, dto.destinations ? JSON.stringify(dto.destinations) : null],
    );
    const trip = trips[0];

    const dates = this.dateRange(dto.dateFrom, dto.dateTo);
    for (let i = 0; i < dates.length; i++) {
      await this.supabase.query(
        `INSERT INTO days (trip_id, date, position) VALUES ($1, $2, $3)`,
        [trip.id, dates[i], i],
      );
    }

    if (dto.useAi && this.ai && this.places) {
      const days = await this.supabase.query(
        `SELECT id, position FROM days WHERE trip_id = $1 ORDER BY position`,
        [trip.id],
      );
      const aiPlaces = await this.ai.generateItinerary({
        destination: dto.name,
        dateFrom: dto.dateFrom,
        dateTo: dto.dateTo,
        interests: dto.interests ?? [],
      });
      for (const p of aiPlaces) {
        const day = days[p.dayIndex] ?? days[days.length - 1];
        await this.places.create(trip.id, userId, {
          name: p.name,
          dayId: day?.id,
          emoji: p.emoji,
          note: p.note,
          priority: p.priority,
        });
      }
    }

    return this.findOne(trip.id, userId);
  }

  async update(tripId: string, userId: string, dto: UpdateTripDto) {
    const existing = await this.supabase.query(
      `SELECT id, date_from, date_to FROM trips WHERE id = $1 AND user_id = $2`,
      [tripId, userId],
    );
    if (!existing.length) throw new NotFoundException('Trip not found');

    const trips = await this.supabase.query(
      `UPDATE trips SET
         name = COALESCE($3, name),
         title = COALESCE($4, title),
         emoji = COALESCE($5, emoji),
         date_from = COALESCE($6, date_from),
         date_to = COALESCE($7, date_to),
         interests = COALESCE($8, interests),
         center_lat = COALESCE($9, center_lat),
         center_lng = COALESCE($10, center_lng),
         destinations = COALESCE($11::jsonb, destinations),
         updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, title, emoji, date_from, date_to, interests, share_token, center_lat, center_lng, destinations, created_at, updated_at`,
      [tripId, userId, dto.name ?? null, dto.title ?? null, dto.emoji ?? null, dto.dateFrom ?? null, dto.dateTo ?? null, dto.interests ?? null, dto.centerLat ?? null, dto.centerLng ?? null, dto.destinations ? JSON.stringify(dto.destinations) : null],
    );

    const dateChanged = dto.dateFrom || dto.dateTo;
    if (dateChanged) {
      const normDate = (v: any): string => {
        if (v instanceof Date) {
          return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
        }
        return String(v ?? '').slice(0, 10);
      };
      const newFrom = normDate(trips[0].date_from);
      const newTo = normDate(trips[0].date_to);

      // Move places from out-of-range days to unassigned, then delete those days
      await this.supabase.query(
        `UPDATE places SET day_id = NULL WHERE trip_id = $1 AND day_id IN (
           SELECT id FROM days WHERE trip_id = $1 AND (date < $2::date OR date > $3::date)
         )`,
        [tripId, newFrom, newTo],
      );
      await this.supabase.query(
        `DELETE FROM days WHERE trip_id = $1 AND (date < $2::date OR date > $3::date)`,
        [tripId, newFrom, newTo],
      );

      // Insert missing days (WHERE NOT EXISTS prevents duplicates)
      for (const date of this.dateRange(newFrom, newTo)) {
        await this.supabase.query(
          `INSERT INTO days (trip_id, date, position)
           SELECT $1, $2::date, 0
           WHERE NOT EXISTS (SELECT 1 FROM days WHERE trip_id = $1 AND date = $2::date)`,
          [tripId, date],
        );
      }

      // Re-assign positions in date order
      const allDays = await this.supabase.query(
        `SELECT id FROM days WHERE trip_id = $1 ORDER BY date`,
        [tripId],
      );
      for (let i = 0; i < allDays.length; i++) {
        await this.supabase.query(`UPDATE days SET position = $1 WHERE id = $2`, [i, allDays[i].id]);
      }
    }

    return this.formatTrip(trips[0]);
  }

  async generateShareToken(tripId: string, userId: string) {
    const trips = await this.supabase.query(
      `SELECT id, share_token FROM trips WHERE id = $1 AND user_id = $2`,
      [tripId, userId],
    );
    if (!trips.length) throw new NotFoundException('Trip not found');

    // Return existing token if already generated
    if (trips[0].share_token) {
      const token = trips[0].share_token;
      return { shareUrl: `${this.config.get('FRONTEND_URL') ?? 'http://localhost:5173'}/share/${token}` };
    }

    const token = randomBytes(12).toString('base64url').slice(0, 16);
    await this.supabase.query(
      `UPDATE trips SET share_token = $1 WHERE id = $2`,
      [token, tripId],
    );
    return { shareUrl: `${this.config.get('FRONTEND_URL') ?? 'http://localhost:5173'}/share/${token}` };
  }

  async findByShareToken(token: string) {
    const trips = await this.supabase.query(
      `SELECT id, name, title, emoji, date_from, date_to, interests, center_lat, center_lng, destinations FROM trips WHERE share_token = $1`,
      [token],
    );
    if (!trips.length) throw new NotFoundException('Shared trip not found');

    const tripId = trips[0].id;
    const days = await this.supabase.query(
      `SELECT id, date, position, destination_index FROM days WHERE trip_id = $1 ORDER BY position`,
      [tripId],
    );
    const places = await this.supabase.query(
      `SELECT * FROM places WHERE trip_id = $1 ORDER BY position`,
      [tripId],
    );

    const placesMap = new Map<string | null, any[]>();
    for (const p of places) {
      const key = p.day_id ?? null;
      if (!placesMap.has(key)) placesMap.set(key, []);
      placesMap.get(key)!.push(this.formatPlace(p));
    }

    return {
      id: trips[0].id,
      name: trips[0].name,
      title: trips[0].title ?? null,
      emoji: trips[0].emoji,
      dateFrom: trips[0].date_from,
      dateTo: trips[0].date_to,
      interests: trips[0].interests ?? [],
      centerLat: trips[0].center_lat ?? null,
      centerLng: trips[0].center_lng ?? null,
      destinations: trips[0].destinations ?? null,
      days: days.map((d) => ({
        id: d.id,
        date: d.date,
        position: d.position,
        destinationIndex: d.destination_index ?? 0,
        places: placesMap.get(d.id) ?? [],
      })),
      unassigned: placesMap.get(null) ?? [],
    };
  }

  async remove(tripId: string, userId: string) {
    const result = await this.supabase.query(
      `DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id`,
      [tripId, userId],
    );
    if (!result.length) throw new NotFoundException('Trip not found');
    return { deleted: true };
  }

  private dateRange(from: any, to: any): string[] {
    const norm = (v: any): string => {
      if (v instanceof Date) {
        return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
      }
      return String(v ?? '').slice(0, 10);
    };
    const dates: string[] = [];
    const current = new Date(norm(from) + 'T12:00:00Z');
    const end = new Date(norm(to) + 'T12:00:00Z');
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return dates;
  }

  private formatTrip(row: any) {
    return {
      id: row.id,
      name: row.name,
      title: row.title ?? null,
      emoji: row.emoji,
      destinations: row.destinations ?? null,
      dateFrom: row.date_from,
      dateTo: row.date_to,
      interests: row.interests ?? [],
      shareToken: row.share_token,
      centerLat: row.center_lat ?? null,
      centerLng: row.center_lng ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private formatPlace(row: any) {
    return {
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      address: row.address,
      website: row.website,
      lat: row.lat,
      lng: row.lng,
      openingHours: row.opening_hours,
      ticket: row.ticket,
      visited: row.visited,
      note: row.note,
      priority: row.priority,
      timeFrom: row.time_from,
      timeTo: row.time_to,
      position: row.position,
      googlePlaceId: row.google_place_id,
    };
  }
}
