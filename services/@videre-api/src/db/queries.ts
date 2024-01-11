/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { toPascalCase } from '@videre/js';

import type { IProxy } from '@/parameters';

import type { PendingSql, Sql } from './postgres';
import { Percentage, CI, fromMatches } from './statistics';
import type { FormatType, EventType, RecordType, ResultType } from './types';


export interface IMatch {
  deck_id: Number,
  date: Date,
  format: FormatType,
  event_id: Number,
  event_type: EventType,
  archetype1: String,
  games: RecordType,
  result: ResultType,
  archetype2: String
};

const getMatches = (sql: Sql, params: IProxy): PendingSql<IMatch[]> => {
  const { format, min_date, max_date } = params;

  return sql`
    SELECT
      a1.deck_id,
      e.date,
      e.format,
      m.event_id,
      e.kind as event_type,
      a1.archetype AS archetype1,
      ARRAY_TO_STRING(ARRAY(
        SELECT CASE
          WHEN game.result = 'win' THEN 'W'
          WHEN game.result = 'loss' THEN 'L'
          WHEN game.result = 'draw' THEN 'T'
        END
        FROM UNNEST(m.games) AS game), '-') AS games,
      m.result,
      a2.archetype AS archetype2
    FROM Matches m
    INNER JOIN Events e ON e.id = m.event_id
    INNER JOIN Decks d1 ON d1.event_id = m.event_id
                        AND d1.player = m.player
    INNER JOIN Decks d2 ON d2.event_id = m.event_id
                        AND d2.player = m.opponent
    INNER JOIN Archetypes a1 ON a1.deck_id = d1.id
    INNER JOIN Archetypes a2 ON a2.deck_id = d2.id
    WHERE m.isBye = FALSE
      AND a1.archetype_id IS NOT NULL
      AND a2.archetype_id IS NOT NULL
      AND e.format = ${toPascalCase(format)}
      AND e.date >= ${min_date}
      AND e.date <= ${max_date}
    ORDER BY
      m.event_id,
      m.round,
    m.player
  `;
}

export interface IMatchup {
  archetype1: String,
  archetype2: String,
  match_count: Number,
  match_winrate: Percentage,
  match_ci: CI,
  game_count: Number,
  game_winrate: Percentage,
  game_ci: CI
};

const getMatchups = (sql: Sql, params: IProxy): PendingSql<IMatchup[]> => {
  const match_entries = getMatches(sql, params);
  const { matches, games } = fromMatches(sql);

  return sql`
    WITH
      match_entries AS (${match_entries})
    SELECT
      archetype1,
      archetype2,
      ${matches.count} AS match_count,
      TO_CHAR(${matches.mean}, 'FM90D00%') AS match_winrate,
      TO_CHAR(${matches.ci}, '±FM90D00%') AS match_ci,
      ${games.count} AS game_count,
      TO_CHAR(${games.mean}, 'FM90D00%') AS game_winrate,
      TO_CHAR(${games.ci}, '±FM90D00%') AS game_ci
    FROM match_entries
    WHERE
      archetype1 != archetype2
    GROUP BY
      archetype1,
      archetype2
    ORDER BY
      match_count DESC,
      match_winrate DESC,
      game_count DESC,
      game_winrate DESC
  `;
}

export interface IPresence {
  archetype: String,
  count: Number,
  percentage: Percentage
};

export const getPresence = (sql: Sql, params: IProxy): PendingSql<IPresence[]> => {
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
      archetype1 AS archetype,
      ${archetype_count} AS count,
      TO_CHAR(${archetype_presence}, 'FM90D00%') AS percentage
    FROM match_entries
    GROUP BY
      archetype1
    ORDER BY
      count DESC
  `;
}

export interface IWinrate {
  archetype: String,
  match_count: Number,
  match_winrate: Percentage,
  match_ci: CI,
  game_count: Number,
  game_winrate: Percentage,
  game_ci: CI
};

export const getWinrates = (sql: Sql, params: IProxy): PendingSql<IWinrate[]> => {
  const match_entries = getMatches(sql, params);
  const { matches, games } = fromMatches(sql);

  return sql`
    WITH
      match_entries AS (${match_entries})
    SELECT
      archetype1 AS archetype,
      ${matches.count} AS match_count,
      TO_CHAR(${matches.mean}, 'FM90D00%') AS match_winrate,
      TO_CHAR(${matches.ci}, '±FM90D00%') AS match_ci,
      ${games.count} AS game_count,
      TO_CHAR(${games.mean}, 'FM90D00%') AS game_winrate,
      TO_CHAR(${games.ci}, '±FM90D00%') AS game_ci
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

export interface IMatchupMatrix {
  archetype: String,
  matchups: IWinrate[]
};

export const getMatchupMatrix = (sql: Sql, params: IProxy): PendingSql<IMatchupMatrix[]> => {
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
