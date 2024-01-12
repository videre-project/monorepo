/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { IProxy } from '@/parameters';

import type { PendingSql, Sql } from '@/db/postgres';
import type { CardQuantityPair } from '@/db/types';

import getEvents from './getEvents';


export interface IDeck {
  id: Number,
  name: String,
  archetype: String,
  archetype_id: Number,
  mainboard: CardQuantityPair[],
  sideboard: CardQuantityPair[]
};

export const getDecks = (
  sql: Sql,
  params: { [key: string]: any }
): PendingSql<IDeck[]> => {
  const event_entries = getEvents(sql, params);

  return sql`
    WITH
      event_entries AS (${event_entries}),
    SELECT
      a.deck_id as id,
      a.name,
      a.archetype,
      a.archetype_id,
      d.mainboard,
      d.sideboard
    FROM Archetypes a
    INNER JOIN Decks d ON d.id = a.deck_id
    INNER JOIN event_entries e ON e.id = d.event_id
    WHERE a.archetype_id IS NOT NULL
      AND e.id IS NOT NULL
    ORDER BY
      a.id DESC
  `;
}

export default getDecks;
