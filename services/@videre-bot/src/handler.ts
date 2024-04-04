/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Error, asJSON } from '@videre-api/responses';

import router from './bot';
import { setBindings } from './bindings';
import type Env from './env';


/**
 * The request context passed through the handler
 */
export interface Context {
  cf: ExecutionContext;
}

export default (req: Request, ctx: Context, env: Env): Promise<Response> =>
  new Promise((resolve) => {
    // Set worker bindings
    setBindings(env);

    // Execute the request
    router
      // Pass Cloudflare provided arguments to the router
      .handle(req, ctx, env)
      // Handle any response transformations
      .then(asJSON)
      .catch(() => Error(500, 'Encountered a fatal error.'))
      // .catch((err) => Error(500, err.stack || err.toString()))
      .then(resolve);
  });
