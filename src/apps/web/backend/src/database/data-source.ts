/**
 * Standalone TypeORM DataSource for CLI operations
 * (migration:generate, migration:run, seed, etc.).
 *
 * Entities are auto-discovered from all *.entity.ts files in src/modules/.
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env.local') });
loadEnv({ path: resolve(__dirname, '../../.env'), override: false });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://mentorai:mentorai123@localhost:5432/mentorai',
  entities: [resolve(__dirname, '../modules/**/*.entity.ts')],
  migrations: [resolve(__dirname, 'migrations/*.{ts,js}')],
  migrationsRun: false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;
