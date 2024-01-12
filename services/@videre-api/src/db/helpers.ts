/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { PendingSql, Sql } from "./postgres";


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
      acc = !i ? cur : sql`${acc} ${sql.unsafe(separator)} ${cur}`,
      sql``
    );
}
