import { Controller, Post, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SupabaseService } from '../../supabase/supabase.service';
import { PlacesService } from '../../places/places.service';

@UseGuards(JwtAuthGuard)
@Controller('trips/:id/ai-generate')
export class AiController {
  constructor(
    private ai: AiService,
    private supabase: SupabaseService,
    private places: PlacesService,
  ) {}

  @Post()
  async generate(@Param('id') tripId: string, @CurrentUser() user: { userId: string }) {
    const trips = await this.supabase.query(
      `SELECT id, name, date_from, date_to, interests FROM trips WHERE id = $1 AND user_id = $2`,
      [tripId, user.userId],
    );
    if (!trips.length) throw new NotFoundException('Trip not found');

    const trip = trips[0];
    const days = await this.supabase.query(
      `SELECT id, position FROM days WHERE trip_id = $1 ORDER BY position`,
      [tripId],
    );

    const aiPlaces = await this.ai.generateItinerary({
      destination: trip.name,
      dateFrom: trip.date_from,
      dateTo: trip.date_to,
      interests: trip.interests ?? [],
    });

    const created: any[] = [];
    for (const p of aiPlaces) {
      const day = days[p.dayIndex] ?? days[days.length - 1];
      const place = await this.places.create(tripId, user.userId, {
        name: p.name,
        dayId: day?.id ?? undefined,
        emoji: p.emoji,
        note: p.note,
        priority: p.priority,
      });
      created.push(place);
    }

    return { places: created };
  }
}
