/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { IProxy } from '@/parameters';

import type { PendingSql, Sql } from '@/db/postgres';
import type { CardQuantityPair } from '@/db/types';


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
  params: IProxy
): PendingSql<IDeck[]> => {
  const { format, min_date, max_date } = params;

  return sql`
    SELECT
      a.deck_id as id,
      a.name,
      a.archetype,
      a.archetype_id,
      d.mainboard,
      d.sideboard
    FROM Archetypes a
    INNER JOIN Decks d ON d.id = a.deck_id
    INNER JOIN Events e ON e.id = d.event_id
    WHERE a.archetype_id IS NOT NULL
      AND e.format = ${format}
      AND e.date >= ${min_date}
      AND e.date <= ${max_date}
    ORDER BY
      a.id DESC
  `;
}

export default getDecks;
