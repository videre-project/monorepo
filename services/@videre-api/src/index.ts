/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type Env from './env';

import handler, { Context } from './handler';


export default {
  fetch: (req: Request, env: Env, cf: ExecutionContext): Promise<Response> =>
    handler(req, { cf, params: {}, sql: null! } as Context, env),
}
