import { Controller, Get, Query, UseGuards, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { GooglePlacesService } from './google-places.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('places')
export class GooglePlacesController {
  constructor(private googlePlaces: GooglePlacesService) {}

  @Get('search-destinations')
  searchDestinations(@Query('q') q: string) {
    return this.googlePlaces.searchDestinations(q);
  }

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('centerLat') centerLat?: string,
    @Query('centerLng') centerLng?: string,
  ) {
    return this.googlePlaces.search(
      q,
      centerLat ? parseFloat(centerLat) : undefined,
      centerLng ? parseFloat(centerLng) : undefined,
    );
  }

  @Get('photo')
  async photo(@Query('googlePlaceId') googlePlaceId: string, @Res() res: Response) {
    const result = await this.googlePlaces.getPhoto(googlePlaceId);
    if (!result) throw new NotFoundException('Photo not found');
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.end(result.buffer);
  }
}
