import { Module } from '@nestjs/common';
import { GooglePlacesController } from './google-places.controller';
import { GooglePlacesService } from './google-places.service';
import { GooglePlacesCallsService } from './google-places-calls.service';
import { GooglePlacesCallsController } from './google-places-calls.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GooglePlacesController, GooglePlacesCallsController],
  providers: [GooglePlacesService, GooglePlacesCallsService],
  exports: [GooglePlacesService],
})
export class GooglePlacesModule {}
