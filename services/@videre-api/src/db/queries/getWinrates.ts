/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { IProxy } from '@/parameters';

import type { PendingSql, Sql } from '@/db/postgres';
import { Percentage, CI, fromMatches } from '@/db/statistics';

import getMatches from './getMatches';


export interface IWinrate {
  archetype: String,
  match_count: Number,
  match_winrate: Percentage,
  match_ci: CI,
  game_count: Number,
  game_winrate: Percentage,
  game_ci: CI
};

export const getWinrates = (
  sql: Sql,
  params: IProxy
): PendingSql<IWinrate[]> => {
  const match_entries = getMatches(sql, params);
  const { matches, games } = fromMatches(sql);

  return sql`
    WITH
      match_entries AS (${match_entries})
    SELECT
      archetype1 AS archetype,
      ${matches.count} AS match_count,
      TO_CHAR(${matches.mean}, 'FM990.00%') AS match_winrate,
      TO_CHAR(${matches.ci}, '±FM990.00%') AS match_ci,
      ${games.count} AS game_count,
      TO_CHAR(${games.mean}, 'FM990.00%') AS game_winrate,
      TO_CHAR(${games.ci}, '±FM990.00%') AS game_ci
    FROM match_entries
    WHERE
      archetype1 != archetype2
    GROUP BY
      archetype1
    ORDER BY
      match_count DESC,
      match_winrate DESC,
      game_count DESC,
      game_winrate DESC
  `;
}

export default getWinrates;
