import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DaysService {
  constructor(private supabase: SupabaseService) {}

  async addDay(tripId: string, userId: string) {
    await this.assertOwner(tripId, userId);

    const days = await this.supabase.query(
      `SELECT date FROM days WHERE trip_id = $1 ORDER BY date DESC LIMIT 1`,
      [tripId],
    );
    if (!days.length) throw new BadRequestException('Trip has no days');

    const lastDate = new Date(days[0].date);
    lastDate.setDate(lastDate.getDate() + 1);
    const newDate = lastDate.toISOString().split('T')[0];

    const position = await this.supabase.query(
      `SELECT COUNT(*) as cnt FROM days WHERE trip_id = $1`,
      [tripId],
    );

    const inserted = await this.supabase.query(
      `INSERT INTO days (trip_id, date, position) VALUES ($1, $2, $3)
       RETURNING id, date, position`,
      [tripId, newDate, parseInt(position[0].cnt)],
    );

    await this.supabase.query(
      `UPDATE trips SET date_to = $1, updated_at = now() WHERE id = $2`,
      [newDate, tripId],
    );

    return { ...inserted[0], places: [] };
  }

  async removeDay(tripId: string, dayId: string, userId: string) {
    await this.assertOwner(tripId, userId);

    const count = await this.supabase.query(
      `SELECT COUNT(*) as cnt FROM days WHERE trip_id = $1`,
      [tripId],
    );
    if (parseInt(count[0].cnt) <= 1) {
      throw new BadRequestException('Cannot delete the last day of a trip');
    }

    const day = await this.supabase.query(
      `SELECT id FROM days WHERE id = $1 AND trip_id = $2`,
      [dayId, tripId],
    );
    if (!day.length) throw new NotFoundException('Day not found');

    // Move places to unassigned
    await this.supabase.query(
      `UPDATE places SET day_id = NULL WHERE day_id = $1`,
      [dayId],
    );

    await this.supabase.query(`DELETE FROM days WHERE id = $1`, [dayId]);

    // Update date_to to new last day
    const lastDay = await this.supabase.query(
      `SELECT date FROM days WHERE trip_id = $1 ORDER BY date DESC LIMIT 1`,
      [tripId],
    );
    await this.supabase.query(
      `UPDATE trips SET date_to = $1, updated_at = now() WHERE id = $2`,
      [lastDay[0].date, tripId],
    );

    return { deleted: true };
  }

  private async assertOwner(tripId: string, userId: string) {
    const rows = await this.supabase.query(
      `SELECT id FROM trips WHERE id = $1 AND user_id = $2`,
      [tripId, userId],
    );
    if (!rows.length) throw new NotFoundException('Trip not found');
  }
}
