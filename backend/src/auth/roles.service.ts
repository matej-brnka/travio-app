import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export type AppRole = 'admin' | 'user';

@Injectable()
export class RolesService {
  constructor(private supabase: SupabaseService) {}

  async getRole(userId: string): Promise<AppRole> {
    const rows = await this.supabase.query<{ role: AppRole }>(
      `SELECT role
       FROM user_roles
       WHERE user_id = $1
       LIMIT 1`,
      [userId],
    );

    return rows[0]?.role === 'admin' ? 'admin' : 'user';
  }

  async isAdmin(userId: string): Promise<boolean> {
    return (await this.getRole(userId)) === 'admin';
  }
}
