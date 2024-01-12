/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { IProxy } from '@/parameters';

import type { PendingSql, Sql } from '@/db/postgres';

import getMatchups from './getMatchups';
import type { IWinrate } from './getWinrates';



export interface IMatchupMatrix {
  archetype: String,
  matchups: IWinrate[]
};

export const getMatchupMatrix = (
  sql: Sql,
  params: IProxy
): PendingSql<IMatchupMatrix[]> => {
  const matchups = getMatchups(sql, params);

  return sql`
    WITH
      matchups AS (${matchups})
    SELECT
      archetype1 AS archetype,
      json_agg(
        json_build_object(
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
      archetype1
    ORDER BY
      SUM(match_count) DESC,
      SUM(game_count) DESC
  `;
}

export default getMatchupMatrix;
