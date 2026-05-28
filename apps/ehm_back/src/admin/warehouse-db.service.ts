import { Injectable, InternalServerErrorException, OnModuleDestroy } from '@nestjs/common';

type QueryParams = Array<string | number | boolean | Date | null | undefined>;

interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number | null;
}

interface PgPool {
  query<T = Record<string, unknown>>(text: string, params?: QueryParams): Promise<QueryResult<T>>;
  end(): Promise<void>;
}

type PgPoolOptions = Record<string, unknown>;

@Injectable()
export class WarehouseDbService implements OnModuleDestroy {
  private pool?: PgPool;

  query<T = Record<string, unknown>>(text: string, params?: QueryParams) {
    return this.getPool().query<T>(text, params);
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  private getPool(): PgPool {
    if (this.pool) {
      return this.pool;
    }

    const pg = require('pg') as { Pool: new (options: Record<string, unknown>) => PgPool };
    this.pool = new pg.Pool(this.getPoolOptions());

    return this.pool;
  }

  private getPoolOptions(): PgPoolOptions {
    const ssl = process.env.POSTGRES_SSL === 'false' ? false : { rejectUnauthorized: false };
    const databaseConfig = {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    };
    const hasDatabaseConfig = Object.values(databaseConfig).some(Boolean);

    if (hasDatabaseConfig) {
      const missingKeys = Object.entries(databaseConfig)
        .filter(([, value]) => !value || value === 'TU_PASSWORD')
        .map(([key]) => (key === 'database' ? 'DATABASE_NAME' : `DATABASE_${key.toUpperCase()}`));
      const port = Number(databaseConfig.port);

      if (missingKeys.length > 0) {
        throw new InternalServerErrorException(
          `Missing database environment variables: ${missingKeys.join(', ')}`,
        );
      }

      if (!Number.isInteger(port)) {
        throw new InternalServerErrorException('DATABASE_PORT must be a valid integer');
      }

      return {
        host: databaseConfig.host,
        port,
        user: databaseConfig.user,
        password: databaseConfig.password,
        database: databaseConfig.database,
        ssl,
      };
    }

    const connectionString = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;

    if (!connectionString) {
      throw new InternalServerErrorException(
        'Missing database configuration. Set DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME or SUPABASE_DB_URL/DATABASE_URL.',
      );
    }

    return { connectionString, ssl };
  }
}
