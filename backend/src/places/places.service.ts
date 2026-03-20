import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { MovePlaceDto } from './dto/move-place.dto';
import { ReorderPlacesDto } from './dto/reorder-places.dto';

@Injectable()
export class PlacesService {
  constructor(private supabase: SupabaseService) {}

  async create(tripId: string, userId: string, dto: CreatePlaceDto) {
    if (!dto.name) throw new BadRequestException('name is required');
    await this.assertOwner(tripId, userId);

    const countRows = await this.supabase.query(
      `SELECT COUNT(*) as cnt FROM places WHERE trip_id = $1 AND day_id IS NOT DISTINCT FROM $2`,
      [tripId, dto.dayId ?? null],
    );
    const position = parseInt(countRows[0].cnt);

    const rows = await this.supabase.query(
      `INSERT INTO places
         (trip_id, day_id, name, emoji, address, website, lat, lng,
          opening_hours, ticket, priority, note, visited, time_from, time_to, google_place_id, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        tripId, dto.dayId ?? null, dto.name, dto.emoji ?? null,
        dto.address ?? null, dto.website ?? null, dto.lat ?? null, dto.lng ?? null,
        dto.openingHours ?? null, dto.ticket ?? null, dto.priority ?? null,
        dto.note ?? null, dto.visited ?? false,
        dto.timeFrom ?? null, dto.timeTo ?? null, dto.googlePlaceId ?? null, position,
      ],
    );
    return this.format(rows[0]);
  }

  async update(tripId: string, placeId: string, userId: string, dto: UpdatePlaceDto) {
    await this.assertOwner(tripId, userId);
    await this.assertPlace(placeId, tripId);

    const rows = await this.supabase.query(
      `UPDATE places SET
         name            = COALESCE($3, name),
         emoji           = COALESCE($4, emoji),
         address         = COALESCE($5, address),
         website         = COALESCE($6, website),
         lat             = COALESCE($7, lat),
         lng             = COALESCE($8, lng),
         opening_hours   = COALESCE($9, opening_hours),
         ticket          = COALESCE($10, ticket),
         visited         = COALESCE($11, visited),
         note            = COALESCE($12, note),
         priority        = COALESCE($13, priority),
         time_from       = COALESCE($14, time_from),
         time_to         = COALESCE($15, time_to),
         updated_at      = now()
       WHERE id = $1 AND trip_id = $2
       RETURNING *`,
      [
        placeId, tripId,
        dto.name ?? null, dto.emoji ?? null, dto.address ?? null,
        dto.website ?? null, dto.lat ?? null, dto.lng ?? null,
        dto.openingHours ?? null, dto.ticket ?? null,
        dto.visited ?? null, dto.note ?? null, dto.priority ?? null,
        dto.timeFrom ?? null, dto.timeTo ?? null,
      ],
    );
    return this.format(rows[0]);
  }

  async remove(tripId: string, placeId: string, userId: string) {
    await this.assertOwner(tripId, userId);
    const result = await this.supabase.query(
      `DELETE FROM places WHERE id = $1 AND trip_id = $2 RETURNING id`,
      [placeId, tripId],
    );
    if (!result.length) throw new NotFoundException('Place not found');
    return { deleted: true };
  }

  async move(tripId: string, placeId: string, userId: string, dto: MovePlaceDto) {
    await this.assertOwner(tripId, userId);
    await this.assertPlace(placeId, tripId);

    const countRows = await this.supabase.query(
      `SELECT COUNT(*) as cnt FROM places WHERE trip_id = $1 AND day_id IS NOT DISTINCT FROM $2`,
      [tripId, dto.targetDayId],
    );
    const newPosition = parseInt(countRows[0].cnt);

    const rows = await this.supabase.query(
      `UPDATE places SET day_id = $2, position = $3, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [placeId, dto.targetDayId, newPosition],
    );
    return this.format(rows[0]);
  }

  async reorder(tripId: string, dayId: string | null, userId: string, dto: ReorderPlacesDto) {
    await this.assertOwner(tripId, userId);

    for (let i = 0; i < dto.placeIds.length; i++) {
      await this.supabase.query(
        `UPDATE places SET position = $3 WHERE id = $1 AND trip_id = $2`,
        [dto.placeIds[i], tripId, i],
      );
    }
    return { reordered: true };
  }

  private async assertOwner(tripId: string, userId: string) {
    const rows = await this.supabase.query(
      `SELECT id FROM trips WHERE id = $1 AND user_id = $2`,
      [tripId, userId],
    );
    if (!rows.length) throw new NotFoundException('Trip not found');
  }

  private async assertPlace(placeId: string, tripId: string) {
    const rows = await this.supabase.query(
      `SELECT id FROM places WHERE id = $1 AND trip_id = $2`,
      [placeId, tripId],
    );
    if (!rows.length) throw new NotFoundException('Place not found');
  }

  private format(row: any) {
    return {
      id: row.id,
      tripId: row.trip_id,
      dayId: row.day_id,
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
