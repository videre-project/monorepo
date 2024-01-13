/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type Env from './env';

import handler, { Context } from './handler';


export default {
  fetch: (req: Request, env: Env, cf: ExecutionContext): Promise<Response> =>
    handler(req, { cf, cache: null!, params: {}, sql: null! } as Context, env),
}
