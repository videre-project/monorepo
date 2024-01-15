/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { RouterType, Route } from 'itty-router';

import { CacheHandler, updateCache } from './cache';
import type { Sql } from './db/postgres';
import type Env from './env';
import { Error, asJSON } from './responses';


/**
 * Maximum request execution time in milliseconds
 */
export const MAX_TIMEOUT = 10_000; // 10 seconds

/**
 * Maximum database query execution time in milliseconds
 */
export const MAX_DB_QUERY_EXECUTION = 8_000; // 8 seconds

/**
 * The request context passed through the handler
 */
export interface Context {
  cf: ExecutionContext;
  params: { [key: string]: any };
  cache: CacheHandler;
  sql: Sql;
}

/**
 * Returns the router based on the provided host.
 * @param req The request to route.
 * @param resolve The resolver function to call if no match is found.
 * @returns The router for the specified host, or null if no match is found.
 */
export function getRouter(
  req: Request,
  resolve: (value: Response) => void
): RouterType<Route, any[]> {
  const host = req.headers.get('host')!;
  switch (host) {
    case 'api.videreproject.com':
      return require('./api').default;
    case 'bot.videreproject.com':
      return require('./bot').default;
    // No host match - invalid, suggests a configuration error.
    default:
      return resolve(Error(404, `The host "${host}" does not exist.`))!;
  }
}

export default (req: Request, ctx: Context, env: Env): Promise<Response> =>
  new Promise((resolve) => {
    // Set a request timeout to prevent hanging requests
    setTimeout(() => resolve(Error(408, 'Request timed out')), MAX_TIMEOUT);

    // Execute the request
    getRouter(req, resolve)
      // Pass Cloudflare provided arguments to the router
      .handle(req, ctx, env)
      // Handle any response transformations
      .then(asJSON)
      .catch(() => Error(500, 'Encountered a fatal error.'))
      // Update the cache if provided a cache handler
      .then((res) => ctx.cache ? updateCache(res, ctx) : res)
      .then(resolve);
  });
