import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('service/invite-gate')
export class InviteGateController {
  constructor(private supabase: SupabaseService) {}

  private normalizeEmail(email?: string): string {
    const normalized = String(email ?? '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      throw new BadRequestException('Invalid email');
    }
    return normalized;
  }

  @Get('check')
  async check(@Query('email') emailParam?: string) {
    const email = this.normalizeEmail(emailParam);
    const rows = await this.supabase.query<{ allowed: boolean }>(
      `SELECT EXISTS(
         SELECT 1
         FROM auth_signup_invites
         WHERE email = $1
           AND revoked_at IS NULL
       ) AS allowed`,
      [email],
    );

    return {
      allowed: rows[0]?.allowed ?? false,
      message: rows[0]?.allowed ? 'Invite found' : 'Registrace je pouze na pozvánku.',
    };
  }
}
