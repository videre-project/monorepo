/* @file
 * Copyright (c) 2026, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import {
  compile,
  jsonBuildObjectFromColumns
} from '@videre/sql-builder';

import type { PendingSql, Sql } from '@/db/postgres';

import { getCardFaces, getCards } from './getCards.ts';
import { CARD_FACE_FIELDS, type ICardDetail } from './types.ts';

const cardFaceJsonObject = compile(jsonBuildObjectFromColumns('f', CARD_FACE_FIELDS));


export const getCard = (
  sql: Sql,
  params: { [key: string]: any }
): PendingSql<ICardDetail[]> => {
  const card = getCards(sql, params);
  const faces = getCardFaces(sql, params);

  return sql`
    SELECT
      c.*,
      COALESCE((
        SELECT json_agg(
          -- cardFaceJsonObject is compiled from the static CARD_FACE_FIELDS list.
          ${sql.unsafe(cardFaceJsonObject.text, [...cardFaceJsonObject.values])}
          ORDER BY f.face_index
        )
        FROM (${faces}) f
      ), '[]'::json) AS faces
    FROM (${card}) c
  `;
}

export default getCard;
