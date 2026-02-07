/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { MAX_DB_QUERY_EXECUTION } from '@/handler';
import { Error } from '@/responses';

import type { PendingSql, RowList, Sql } from "./postgres";


/**
 * Joins a list of SQL statements together with a separator.
 * @param sql The SQL template tag.
 * @param statements The list of SQL statements to join.
 * @param separator The separator to use between statements.
 * @returns The joined SQL statement.
 */
export function Join(
  sql: Sql,
  statements: PendingSql<any>[],
  separator: 'AND' | 'OR' = 'AND'
): PendingSql<any> {
  return statements
    .filter(Boolean)
    .reduce((acc, cur, i) =>
      acc = !i ? cur : sql`${acc} ${sql.unsafe(separator)} ${cur}`, null!
    );
}

/**
 * Executes a SQL query to use for a response.
 * @param query The query to execute.
 * @param parameters The parameters used by the query.
 * @returns The results of the query.
 */
export async function Execute(
  query: PendingSql<any[]>,
  parameters: { [key: string]: any } = {}
) {
  const start = performance.now();
  let data: RowList<any[]> = null!;
  try {
    data = await new Promise<typeof data>((resolve, reject) => {
      // Set a maximum timeout for the query.
      setTimeout(
        () => {
          query.cancel(); // Cancel any executing queries / fragments.
          return reject(Error(500, 'Database query timed out.'))
        },
        MAX_DB_QUERY_EXECUTION
      );
      // Execute the query within the next tick.
      query
        .then(resolve)
        .catch(reject);
    });
  } catch (err: any) {
    console.error('[Execute] Fatal error:', err);

    // Be extremely aggressive about capturing the error detail
    const errorDetail: any = {};
    if (err instanceof globalThis.Error) {
      errorDetail.message = (err as any).message;
      errorDetail.name = (err as any).name;
      errorDetail.stack = (err as any).stack;
    }

    // Copy all enumerable properties
    for (const key in err) {
      try {
        errorDetail[key] = (err as any)[key];
      } catch (e) {
        errorDetail[key] = "[Unserializable]";
      }
    }

    const finalMessage = errorDetail.message || String(err);
    console.error('[Execute] Serialized error:', JSON.stringify(errorDetail));

    return Error(500, 'Encountered a fatal error while executing the query.', {
      error: finalMessage,
      details: errorDetail
    });
  }

  const { host, backend, ...params } = parameters;
  const output = {
    parameters: params,
    meta: {
      database: host,
      backend: backend,
      exec_ms: Number((performance.now() - start).toFixed(3)),
      row_count: data?.length || 0,
    },
    data
  };

  if (!data?.length)
    return Error(400, 'No results found.', output);

  return output;
}

export async function Analyze(sql: Sql, query: PendingSql<any>): Promise<any> {
  return await sql`
    EXPLAIN (
      ANALYZE,
      COSTS OFF,
      TIMING OFF,
      FORMAT JSON
    ) ${query}
  `;
}
