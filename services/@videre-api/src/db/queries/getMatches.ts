/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { PendingSql, Sql } from '@/db/postgres';
import type {
  FormatType,
  EventType,
  RecordType,
  ResultType
} from '@/db/types';

import getEvents from './getEvents';


export interface IMatch {
  id1: Number,
  id2: Number,
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

export const getMatches = (
  sql: Sql,
  params: { [key: string]: any }
): PendingSql<IMatch[]> => {
  const event_entries = getEvents(sql, params as any);

  return sql`
    WITH
      event_entries AS (${event_entries})
    SELECT
      a1.archetype_id as id1,
      a2.archetype_id as id2,
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
    INNER JOIN Decks d1 ON d1.event_id = m.event_id
                        AND d1.player = m.player
    INNER JOIN Decks d2 ON d2.event_id = m.event_id
                        AND d2.player = m.opponent
    INNER JOIN Archetypes a1 ON a1.deck_id = d1.id
    INNER JOIN Archetypes a2 ON a2.deck_id = d2.id
    INNER JOIN event_entries e ON e.id = m.event_id
    WHERE m.isBye = FALSE
      AND a1.archetype_id IS NOT NULL
      AND a2.archetype_id IS NOT NULL
      AND e.id IS NOT NULL
    ORDER BY
      m.event_id,
      m.round,
    m.player
  `;
}

export default getMatches;
