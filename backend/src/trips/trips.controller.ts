import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
export class TripsController {
  constructor(private trips: TripsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('trips')
  findAll(@CurrentUser() user: { userId: string }) {
    return this.trips.findAll(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('trips')
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateTripDto) {
    return this.trips.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('trips/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.trips.findOne(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('trips/:id')
  update(@Param('id') id: string, @CurrentUser() user: { userId: string }, @Body() dto: UpdateTripDto) {
    return this.trips.update(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('trips/:id')
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.trips.remove(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('trips/:id/share')
  share(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.trips.generateShareToken(id, user.userId);
  }

  // Public endpoint – no auth
  @Get('shared/:token')
  sharedTrip(@Param('token') token: string) {
    return this.trips.findByShareToken(token);
  }
}
