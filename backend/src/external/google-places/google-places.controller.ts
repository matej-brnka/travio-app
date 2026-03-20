import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GooglePlacesService } from './google-places.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('places')
export class GooglePlacesController {
  constructor(private googlePlaces: GooglePlacesService) {}

  @Get('search')
  search(@Query('q') q: string) {
    return this.googlePlaces.search(q);
  }
}
