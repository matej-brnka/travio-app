import { Controller, Get, Query } from '@nestjs/common';
import { GooglePlacesCallsService } from './google-places-calls.service';

@Controller('google-places')
export class GooglePlacesCallsController {
  constructor(private calls: GooglePlacesCallsService) {}

  @Get('calls')
  async listCalls(@Query('limit') limit?: string) {
    const calls = await this.calls.listCalls(limit ? parseInt(limit, 10) : 500);
    return { calls };
  }
}
