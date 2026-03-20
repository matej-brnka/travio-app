import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Controller()
export class AppController {
  constructor(private supabase: SupabaseService) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('health/db')
  async healthDb() {
    const rows = await this.supabase.query<{ now: string }>('SELECT now()');
    return { status: 'ok', db_time: rows[0].now };
  }
}
