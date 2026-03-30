import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GooglePlacesCallsService } from './google-places-calls.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';

@Controller('google-places')
export class GooglePlacesCallsController {
  constructor(private calls: GooglePlacesCallsService) {}

  @Get('calls')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listCalls(@Query('limit') limit?: string) {
    const calls = await this.calls.listCalls(limit ? parseInt(limit, 10) : 500);
    return { calls };
  }
}
