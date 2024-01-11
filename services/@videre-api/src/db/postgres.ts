/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import postgres from 'postgres';

import type Env from '@/env';
import type { Context } from '@/handler';


export type Sql = postgres.Sql<{}>;

export type PendingSql<T> = postgres.PendingQuery<postgres.Row[]>;

export function withPostgres(req: any, ctx: Context, env: Env): void {
	ctx.sql = postgres({
		host:			env.PGHOST.toString(),
		database: env.PGDATABASE,
		username: env.PGUSER,
		password: env.PGPASSWORD,
		port: 5432,
		ssl: "require",
		// Type mapping options
		transform: {
			undefined: null
		}
	}) as Sql;
}
