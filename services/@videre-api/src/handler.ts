/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error, json } from 'itty-router';

import router from './api';
import type { Sql } from './db/postgres';
import type Env from './env';


/**
 * Maximum request execution time in milliseconds
 */
const MAX_TIMEOUT = 10_000;

export interface Context {
  cf: ExecutionContext;
  params: { [key: string]: any };
  sql: Sql;
}

export default (req: Request, ctx: Context, env: Env): Promise<Response> =>
  new Promise((resolve) => {
    // Set a maximum request time of 10 seconds
    setTimeout(() => resolve(error(408, 'Request timed out')), MAX_TIMEOUT);

    router
      // Catch-all for any other requests
      .all('*', () => error(404))
      // Pass Cloudflare provided arguments to the router
      .handle(req, ctx, env)
      // Handle any response transformations
      .then((res => {
        if (res instanceof Response) return res;
        return json({
          parameters: ctx.params,
          data: res
        });
      }))
      .catch(error)
      .then(resolve);
  });
