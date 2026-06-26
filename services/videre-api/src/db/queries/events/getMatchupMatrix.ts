/* @file
 * Copyright (c) 2026, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { PendingSql, Sql } from '../../postgres.ts';

import getMatchups from './getMatchups.ts';
import type { IMatchupMatrix } from './types.ts';

export const getMatchupMatrix = (
  sql: Sql,
  params: { [key: string]: any }
): PendingSql<IMatchupMatrix[]> => {
  const matchups = getMatchups(sql, params);

  return sql`
    WITH
      matchups AS (${matchups})
    SELECT
      id1 as id,
      archetype1 AS archetype,
      json_agg(
        json_build_object(
          'id', id2,
          'archetype', archetype2,
          'match_count', match_count,
          'match_winrate', match_winrate,
          'match_ci', match_ci,
          'game_count', game_count,
          'game_winrate', game_winrate,
          'game_ci', game_ci
        )
        ORDER BY
          match_count DESC,
          match_winrate DESC,
          game_count DESC,
          game_winrate DESC
      ) AS matchups
    FROM matchups
    GROUP BY
      id1,
      archetype1
    ORDER BY
      SUM(match_count) DESC,
      SUM(game_count) DESC
  `;
}

export default getMatchupMatrix;
