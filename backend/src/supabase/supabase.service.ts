import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, types } from 'pg';

// Parse DATE columns as plain strings (YYYY-MM-DD) instead of JS Date objects
// to avoid local-timezone midnight causing off-by-one date bugs
types.setTypeParser(1082, (val: string) => val);

@Injectable()
export class SupabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(SupabaseService.name);
  private pool: Pool;

  constructor(private config: ConfigService) {
    this.pool = new Pool({
      host: config.getOrThrow('SUPABASE_URL'),
      port: parseInt(config.get('SUPABASE_PORT') ?? '5432'),
      database: config.get('SUPABASE_DATABASE') ?? 'postgres',
      user: config.get('SUPABASE_USER') ?? 'postgres',
      password: config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
      ssl: { rejectUnauthorized: false },
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected DB pool error', err.message);
    });
  }

  get db(): Pool {
    return this.pool;
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (err: any) {
      this.logger.error(`DB query failed: ${err.message}`, { sql: sql.slice(0, 120), params });
      throw err;
    }
  }

  async withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
