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
  let data: RowList<any[]> = null!;
  try {
    data = await new Promise<typeof data>((resolve, reject) => {
      // Set a maximum timeout for the query.
      setTimeout(() =>
        reject(Error(500, 'Database query timed out.')),
        MAX_DB_QUERY_EXECUTION
      );
      // Execute the query.
      query
        .then(resolve)
        .catch(reject);
    });
  } catch (err) {
    return Error(500, 'Encountered a fatal error while executing the query.');
  }

  const output = { parameters, data };
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
