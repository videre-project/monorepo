/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { PendingSql, Sql } from '@/db/postgres';
import type { Percentage, CI } from '@/db/statistics';

import getPresence from './getPresence';
import getWinrates from './getWinrates';


export interface IMetagame {
  id: Number,
  archetype: String,
  count: Number,
  percentage: Percentage,
  match_count: Number,
  match_winrate: Percentage,
  match_ci: CI,
  game_count: Number,
  game_winrate: Percentage,
  game_ci: CI
};

export const getMetagame = (
  sql: Sql,
  params: { [key: string]: any }
): PendingSql<IMetagame[]> => {
  const presence = getPresence(sql, params);
  const winrates = getWinrates(sql, params);

  return sql`
    WITH
      presence AS (${presence}),
      winrates AS (${winrates})
    SELECT *
    FROM presence p
    INNER JOIN winrates w ON
      w.archetype = p.archetype
    ORDER BY
      p.count DESC,
      w.match_count DESC,
      w.match_winrate DESC,
      w.game_count DESC,
      w.game_winrate DESC
  `;
}

export default getMetagame;
