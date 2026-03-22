import { Controller, Post, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
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

  @Patch(':dayId/destination')
  updateDestination(
    @Param('id') tripId: string,
    @Param('dayId') dayId: string,
    @Body('destinationIndex') destinationIndex: number,
    @CurrentUser() user: { userId: string },
  ) {
    return this.days.updateDestination(tripId, dayId, user.userId, destinationIndex);
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
