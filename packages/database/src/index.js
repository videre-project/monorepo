import postgres from 'postgres';
import { PrismaClient } from '@prisma/client'

import config from './config';

export * as CONSTANTS from './constants';

export * from './postgres';
export * from './utils';

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

/**
 * Creates a new prisma client instance.
 */
export const prisma = new PrismaClient();

/**
 * Creates a promise that resolves after a specified amount of milliseconds.
 */
export const setDelay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Converts an integer to an ordinal.
 */
export const getNumberWithOrdinal = n => {
  let s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Removes undefined object keys.
 */
export const pruneObjectKeys = object => {
  return Object.entries(object)
    .filter(([, v]) =>
      typeof v == 'object'
        ? (v != null && JSON.stringify(v)!='{}' && JSON.stringify(v)!='[]')
        : v != undefined
    ).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};