import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { DaysService } from './days.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('trips/:id/days')
export class DaysController {
  constructor(private days: DaysService) {}

  @Post()
  addDay(@Param('id') tripId: string, @CurrentUser() user: { userId: string }) {
    return this.days.addDay(tripId, user.userId);
  }

  @Delete(':dayId')
  removeDay(
    @Param('id') tripId: string,
    @Param('dayId') dayId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.days.removeDay(tripId, dayId, user.userId);
  }
}
