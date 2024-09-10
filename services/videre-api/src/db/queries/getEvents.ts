/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Join } from '@/db/helpers';
import type { PendingSql, Sql } from '@/db/postgres';
import type { EventType, FormatType } from '@/db/types';


export interface IEvent {
  id: Number,
  name: String,
  date: Date,
  format: FormatType,
  kind: EventType,
  rounds: Number,
  players: Number
};

export const getEvents = (
  sql: Sql,
  params: { [key: string]: any }
): PendingSql<IEvent[]> => {
  const {
    format,
    event_id,
    min_date,
    max_date
  } = params;

  return sql`
    SELECT *
    FROM Events
    WHERE ${Join(sql,
      event_id ? [sql`id = ${event_id}`] :
    [
      format   && sql`format = ${format}`,
      min_date && sql`date >= ${min_date}`,
      max_date && sql`date <= ${max_date}`
    ], 'AND')}
    ORDER BY
      date DESC,
      id DESC
  `;
}

export default getEvents;
