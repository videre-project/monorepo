/* @file
 * Copyright (c) 2026, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { CardQuantityPair, EventType, FormatType, ResultType } from '@/db/types';
import type { CI, Percentage } from '@/db/statistics';
import type { TableColumn } from '../../schema.g.ts';

const field = <T>() => undefined as unknown as T;

export type EventQueryParams = {
  readonly format?: string | null,
  readonly event_id?: number | null,
  readonly min_date?: string | null,
  readonly max_date?: string | null,
};

const eventShape = {
  id: field<number>(),
  name: field<string>(),
  date: field<Date>(),
  format: field<FormatType>(),
  kind: field<EventType>(),
  rounds: field<number>(),
  players: field<number>(),
} satisfies Partial<Record<TableColumn<'events'>, unknown>>;

export type IEvent = typeof eventShape;

export type EventField = Extract<keyof IEvent, TableColumn<'events'>>;

export const EVENT_FIELDS = Object.keys(eventShape) as readonly EventField[];

export type IDeck = {
  id: number,
  name: string,
  archetype: string,
  archetype_id: number,
  mainboard: CardQuantityPair[],
  sideboard: CardQuantityPair[]
};

export type IMatch = {
  id1: number,
  id2: number,
  deck_id: number,
  date: Date,
  format: FormatType,
  event_id: number,
  event_type: EventType,
  archetype1: string,
  games: string,
  result: ResultType,
  archetype2: string
};

export type ICardStatistics = {
  card: string,
  count: number,
  percentage: Percentage,
  total: number,
  average: number
};

export type IDeckStatistics = {
  id: number,
  archetype: string,
  count: number,
  mainboard: ICardStatistics[],
  sideboard: ICardStatistics[]
};

export type IMetagame = {
  id: number,
  archetype: string,
  count: number,
  percentage: Percentage,
  match_count: number,
  match_winrate: Percentage,
  match_ci: CI,
  game_count: number,
  game_winrate: Percentage,
  game_ci: CI
};

export type IMatchup = {
  id1: string,
  id2: string,
  archetype1: string,
  archetype2: string,
  match_count: number,
  match_winrate: Percentage,
  match_ci: CI,
  game_count: number,
  game_winrate: Percentage,
  game_ci: CI
};

export type IMatchupSummary = {
  id: string,
  archetype: string,
  match_count: number,
  match_winrate: Percentage,
  match_ci: CI,
  game_count: number,
  game_winrate: Percentage,
  game_ci: CI
};

export type IMatchupMatrix = {
  id: string,
  archetype: string,
  matchups: IMatchupSummary[]
};
