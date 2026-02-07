/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import postgres from 'postgres';

import { createWebSocketFactory } from './transport';

import type Env from '@/env';
import type { Context } from '@/handler';


export type Sql = postgres.Sql<{}>;

//
// Unfortunately, TypeScript cannot deduce whether extensions of 'any' are
// actually a superset of the original type. Refer to below for more details:
// https://github.com/microsoft/TypeScript/wiki/Breaking-Changes#type-parameters-that-extend-any-no-longer-act-as-any
//
// export type PendingSql<T extends readonly any[]> = postgres.PendingQuery<T>;
export type PendingSql<T extends any> = postgres.PendingQuery<any>;

export type RowList<T extends readonly any[]> = postgres.RowList<T>;

export function withPostgres(req: any, ctx: Context, env: Env): void {
  // Inject the host and backend into parameters for debugging
  ctx.params.host = `${env.PGUSER}@${env.PGHOST}/${env.PGDATABASE}`;
  ctx.params.backend = 'postgres';

  // @ts-expect-error - Input vars must have implicit string operators
  ctx.sql = postgres({
    host: env.PGHOST,
    database: env.PGDATABASE,
    username: env.PGUSER,
    password: env.PGPASSWORD,
    port: parseInt(env.PGPORT || '5432'),
    // Default to 'require' (Production). Only disable if explicitly set to 'false' (Local).
    // Note: If we use the tunnel transport, we handle SSL at the transport layer, so we disable it in the driver.
    ssl: env.PGHOST.toString().includes('videreproject.com') ? false : (env.PGSSL === 'false' || env.PGSSL === false ? false : 'require'),
    // Type mapping options
    transform: {
      undefined: null
    },
    // Use the WebSocket tunnel transport for production host
    socket: env.PGHOST.toString().includes('videreproject.com')
      ? createWebSocketFactory(env)
      : undefined
  }) as Sql;
}
