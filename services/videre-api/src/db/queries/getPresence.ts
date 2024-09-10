/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { PendingSql, Sql } from '@/db/postgres';
import type { Percentage } from '@/db/statistics';

import getMatches from './getMatches';


export interface IPresence {
  archetype: String,
  count: Number,
  percentage: Percentage
};

export const getPresence = (
  sql: Sql,
  params: { [key: string]: any }
): PendingSql<IPresence[]> => {
  const match_entries = getMatches(sql, params);

  const archetype_count = sql`COUNT(DISTINCT deck_id)::int`;
  const archetype_presence = sql`
    (${archetype_count} * 100.0 /
     (SELECT ${archetype_count} FROM match_entries))
  `;

  return sql`
    WITH
      match_entries AS (${match_entries})
    SELECT
      id1 as id,
      archetype1 AS archetype,
      ${archetype_count} AS count,
      TO_CHAR(${archetype_presence}, 'FM990.00%') AS percentage
    FROM match_entries
    GROUP BY
      id,
      archetype
    ORDER BY
      count DESC
  `;
}

export default getPresence;
