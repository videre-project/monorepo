/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

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
  try {
    const data = await query as RowList<any[]>;
    if (!data.length)
      return Error(400, 'No results found.', { parameters, data });

    return { parameters, data };
  } catch (err) {
    return Error(500, 'Encountered a fatal error while executing the query.');
  }
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
