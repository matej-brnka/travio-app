import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupabaseService } from '../supabase/supabase.service';
import { AdminGuard } from '../auth/admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('service/invites')
export class InvitesController {
  constructor(private supabase: SupabaseService) {}

  private normalizeEmail(email?: string): string {
    const normalized = String(email ?? '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      throw new BadRequestException('Invalid email');
    }
    return normalized;
  }

  @Get()
  async list(@Query('limit') limitParam?: string) {
    const limit = Math.max(1, Math.min(parseInt(limitParam ?? '200', 10) || 200, 1000));
    const rows = await this.supabase.query<any>(
      `SELECT email, note, created_at, accepted_at, revoked_at
       FROM auth_signup_invites
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );

    return {
      invites: rows.map((r) => ({
        email: r.email,
        note: r.note ?? null,
        createdAt: r.created_at,
        acceptedAt: r.accepted_at,
        revokedAt: r.revoked_at,
      })),
    };
  }

  @Post()
  async upsert(@Body() body: { email?: string; note?: string }) {
    const email = this.normalizeEmail(body?.email);
    const note = body?.note?.trim() || null;

    const rows = await this.supabase.query<any>(
      `INSERT INTO auth_signup_invites (email, note, revoked_at)
       VALUES ($1, $2, NULL)
       ON CONFLICT (email)
       DO UPDATE SET
         note = COALESCE(EXCLUDED.note, auth_signup_invites.note),
         revoked_at = NULL
       RETURNING email, note, created_at, accepted_at, revoked_at`,
      [email, note],
    );

    const r = rows[0];
    return {
      invite: {
        email: r.email,
        note: r.note ?? null,
        createdAt: r.created_at,
        acceptedAt: r.accepted_at,
        revokedAt: r.revoked_at,
      },
    };
  }

  @Post('revoke')
  async revoke(@Body() body: { email?: string }) {
    const email = this.normalizeEmail(body?.email);

    await this.supabase.query(
      `UPDATE auth_signup_invites
       SET revoked_at = now()
       WHERE email = $1`,
      [email],
    );

    return { ok: true };
  }

  @Post('restore')
  async restore(@Body() body: { email?: string }) {
    const email = this.normalizeEmail(body?.email);

    await this.supabase.query(
      `UPDATE auth_signup_invites
       SET revoked_at = NULL
       WHERE email = $1`,
      [email],
    );

    return { ok: true };
  }

  @Delete()
  async remove(@Query('email') emailParam?: string) {
    const email = this.normalizeEmail(emailParam);
    await this.supabase.query(`DELETE FROM auth_signup_invites WHERE email = $1`, [email]);
    return { ok: true };
  }
}
