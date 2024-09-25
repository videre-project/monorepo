/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { PendingSql, Sql } from '@/db/postgres';
import { Percentage } from '@/db/statistics';

import getDecks from './getDecks';
import getPresence from './getPresence';


export interface ICardStatistics {
  card: String,
  count: Number,
  percentage: Percentage,
  total: Number,
  average: Number
}

export interface IDeckStatistics {
  archetype: String,
  mainboard: ICardStatistics[],
  sideboard: ICardStatistics[]
}

export const getDeckStatistics = (
  sql: Sql,
  params: { [key: string]: any }
): PendingSql<IDeckStatistics[]> => {
  const deck_entries = getDecks(sql, params);
  const presence = getPresence(sql, params);

  const mapping: Record<string, PendingSql<IDeckStatistics[]>> = {};
  for (const board of [ 'mainboard', 'sideboard' ]) {
    const board_entries = sql`
      WITH
        entries AS (${deck_entries})
      SELECT
        e.archetype_id,
        c.name as card,
        COUNT(DISTINCT e.id)::int as count,
        SUM(c.quantity)::int as total,
        ROUND(
          SUM(c.quantity) / (1.0 * COUNT(DISTINCT e.id)), 2
        )::float AS average
      FROM entries e, unnest(${sql('e.' + board)}) AS c (id, name, quantity)
      WHERE
        e.archetype_id is not null
      GROUP BY
        e.archetype_id, c.name,
        e.archetype
      ORDER BY
        archetype,
        count DESC,
        total DESC,
        average DESC,
        card ASC
    `;

    mapping[board] = sql`
      WITH
        presence AS (${presence}),
        board_entries AS (${board_entries})
      SELECT
        p.id as archetype_id,
        json_agg(
          json_build_object(
            'card', e.card,
            'count', LEAST(e.count, p.count),
            'percentage', TO_CHAR(LEAST(e.count, p.count) * (100.0 / p.count), 'FM990.00%'),
            'total', e.total,
            'average', e.average
          )
          ORDER BY
            e.count DESC,
            e.total DESC,
            e.average DESC
        ) AS ${sql(board as string)}
      FROM board_entries e
      INNER JOIN presence p ON p.id = e.archetype_id
      WHERE
        e.count * (100.0 / p.count) >= 1.0
      GROUP BY
        p.id
    `;
  }

  return sql`
    WITH
      presence AS (${presence}),
      mainboard_entries AS (${mapping.mainboard}),
      sideboard_entries AS (${mapping.sideboard})
    SELECT
      p.id,
      p.archetype,
      p.count,
      m.mainboard,
      s.sideboard
    FROM presence p
    INNER JOIN mainboard_entries m ON m.archetype_id = p.id
    INNER JOIN sideboard_entries s ON s.archetype_id = p.id
    ORDER BY
      p.count DESC
  `;
}

export default getDeckStatistics;
