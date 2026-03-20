import { Module } from '@nestjs/common';
import { GooglePlacesController } from './google-places.controller';
import { GooglePlacesService } from './google-places.service';

@Module({
  controllers: [GooglePlacesController],
  providers: [GooglePlacesService],
})
export class GooglePlacesModule {}
