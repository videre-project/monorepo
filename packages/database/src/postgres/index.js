import postgres from 'postgres';

import config from './../config';

export * as STATISTICS from './statistics';
export * from './functions';
export * from './tools';

/**
 * Queries database, accepts a template string or JSON to format.
 *
 * @example sql`SELECT * FROM users`
 * @example sql`INSERT INTO users ${sql(user)}`
 */
export const sql = postgres(
  config.connectionString || 'postgresql://postgres:videre@127.0.0.1:5432/postgres',
  {
    max: 1,
    idle_timeout: 3,
    connect_timeout: 5,
  }
);