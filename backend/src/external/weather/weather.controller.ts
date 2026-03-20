import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private weather: WeatherService) {}

  @Get()
  getWeather(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('date') date: string,
  ) {
    return this.weather.getWeather(parseFloat(lat), parseFloat(lng), date);
  }
}
