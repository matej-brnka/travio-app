import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

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
    const result = await this.pool.query(sql, params);
    return result.rows;
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
