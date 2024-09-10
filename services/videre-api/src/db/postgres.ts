/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import postgres from 'postgres';

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
  // @ts-expect-error - Input vars must have implicit string operators
	ctx.sql = postgres({
		host:			env.PGHOST,
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
