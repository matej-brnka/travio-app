import { Controller, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { MovePlaceDto } from './dto/move-place.dto';
import { ReorderPlacesDto } from './dto/reorder-places.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('trips/:id')
export class PlacesController {
  constructor(private places: PlacesService) {}

  @Post('places')
  create(@Param('id') tripId: string, @CurrentUser() user: { userId: string }, @Body() dto: CreatePlaceDto) {
    return this.places.create(tripId, user.userId, dto);
  }

  @Patch('places/:placeId')
  update(
    @Param('id') tripId: string,
    @Param('placeId') placeId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdatePlaceDto,
  ) {
    return this.places.update(tripId, placeId, user.userId, dto);
  }

  @Delete('places/:placeId')
  remove(
    @Param('id') tripId: string,
    @Param('placeId') placeId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.places.remove(tripId, placeId, user.userId);
  }

  @Patch('places/:placeId/move')
  move(
    @Param('id') tripId: string,
    @Param('placeId') placeId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: MovePlaceDto,
  ) {
    return this.places.move(tripId, placeId, user.userId, dto);
  }

  @Patch('days/:dayId/reorder')
  reorder(
    @Param('id') tripId: string,
    @Param('dayId') dayId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: ReorderPlacesDto,
  ) {
    return this.places.reorder(tripId, dayId, user.userId, dto);
  }
}
