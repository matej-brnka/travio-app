import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string) {
    const rows = await this.supabase.query(
      `SELECT id, name, emoji, date_from, date_to, interests, share_token, created_at, updated_at
       FROM trips WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return rows.map(this.formatTrip);
  }

  async findOne(tripId: string, userId: string) {
    const trips = await this.supabase.query(
      `SELECT id, name, emoji, date_from, date_to, interests, share_token
       FROM trips WHERE id = $1 AND user_id = $2`,
      [tripId, userId],
    );
    if (!trips.length) throw new NotFoundException('Trip not found');

    const days = await this.supabase.query(
      `SELECT id, date, position FROM days WHERE trip_id = $1 ORDER BY position`,
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
      `INSERT INTO trips (user_id, name, emoji, date_from, date_to, interests)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, emoji, date_from, date_to, interests, share_token, created_at, updated_at`,
      [userId, dto.name, dto.emoji, dto.dateFrom, dto.dateTo, dto.interests ?? null],
    );
    const trip = trips[0];

    const dates = this.dateRange(dto.dateFrom, dto.dateTo);
    for (let i = 0; i < dates.length; i++) {
      await this.supabase.query(
        `INSERT INTO days (trip_id, date, position) VALUES ($1, $2, $3)`,
        [trip.id, dates[i], i],
      );
    }

    return this.formatTrip(trip);
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
         emoji = COALESCE($4, emoji),
         date_from = COALESCE($5, date_from),
         date_to = COALESCE($6, date_to),
         interests = COALESCE($7, interests),
         updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, emoji, date_from, date_to, interests, share_token, created_at, updated_at`,
      [tripId, userId, dto.name ?? null, dto.emoji ?? null, dto.dateFrom ?? null, dto.dateTo ?? null, dto.interests ?? null],
    );

    const dateChanged = dto.dateFrom || dto.dateTo;
    if (dateChanged) {
      const updated = trips[0];
      await this.supabase.query(`DELETE FROM days WHERE trip_id = $1`, [tripId]);
      const dates = this.dateRange(updated.date_from, updated.date_to);
      for (let i = 0; i < dates.length; i++) {
        await this.supabase.query(
          `INSERT INTO days (trip_id, date, position) VALUES ($1, $2, $3)`,
          [tripId, dates[i], i],
        );
      }
    }

    return this.formatTrip(trips[0]);
  }

  async remove(tripId: string, userId: string) {
    const result = await this.supabase.query(
      `DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id`,
      [tripId, userId],
    );
    if (!result.length) throw new NotFoundException('Trip not found');
    return { deleted: true };
  }

  private dateRange(from: string, to: string): string[] {
    const dates: string[] = [];
    const current = new Date(from);
    const end = new Date(to);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  private formatTrip(row: any) {
    return {
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      dateFrom: row.date_from,
      dateTo: row.date_to,
      interests: row.interests ?? [],
      shareToken: row.share_token,
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
