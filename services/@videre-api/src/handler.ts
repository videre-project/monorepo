/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import router from './api';
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

export default (req: Request, ctx: Context, env: Env): Promise<Response> =>
  new Promise((resolve) => {
    // Set a request timeout to prevent hanging requests
    setTimeout(() => resolve(Error(408, 'Request timed out')), MAX_TIMEOUT);

    // Execute the request
    router
      // Pass Cloudflare provided arguments to the router
      .handle(req, ctx, env)
      // Handle any response transformations
      .then(asJSON)
      .catch(() => Error(500, 'Encountered a fatal error.'))
      // Update the cache if provided a cache handler
      .then((res) => ctx.cache ? updateCache(res, ctx) : res)
      .then(resolve);
  });
