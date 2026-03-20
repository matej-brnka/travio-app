import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { DaysModule } from './days/days.module';
import { PlacesModule } from './places/places.module';
import { GooglePlacesModule } from './external/google-places/google-places.module';
import { WeatherModule } from './external/weather/weather.module';
import { AiModule } from './external/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    SupabaseModule,
    AuthModule,
    TripsModule,
    DaysModule,
    PlacesModule,
    GooglePlacesModule,
    WeatherModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
