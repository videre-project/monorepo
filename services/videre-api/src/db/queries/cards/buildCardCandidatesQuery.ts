/* @file
 * Copyright (c) 2026, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import {
  and,
  eq,
  notExists,
  raw,
  select,
  sql,
  type SqlFragment
} from '@videre/sql-builder';
import { table } from '../../schema.g.ts';
import { candidateOrder } from './modes.ts';
import {
  cardPredicates,
  legalityPredicate,
  tokenPredicate,
  typePredicateForCard,
  usesUniqueNameFastPath
} from './predicates.ts';
import type {
  CardOrderDirection,
  CardOrderMode,
  CardQueryParams,
  UniqueMode
} from './types.ts';

type CardCandidateQueryOptions = {
  readonly params: CardQueryParams,
  readonly uniqueMode: UniqueMode,
  readonly orderMode: CardOrderMode,
  readonly orderDirection: CardOrderDirection,
  readonly limit: number,
  readonly offset: number,
};

const cards = table('cards', 'c');
const sets = table('sets', 's');
const otherCards = table('cards', 'c2');
const otherSets = table('sets', 's2');

export function buildCardCandidatesQuery(options: CardCandidateQueryOptions): SqlFragment {
  return usesUniqueNameFastPath(options.params, options.uniqueMode, options.orderMode)
    ? fastUniqueNameCandidateQuery(options)
    : genericCandidateQuery(options);
}

function genericCandidateQuery(options: CardCandidateQueryOptions): SqlFragment {
  const {
    params,
    uniqueMode,
    orderMode,
    orderDirection,
    limit,
    offset,
  } = options;
  const uniqueCardOrder = uniqueMode === 'cards'
    ? sql`
      ORDER BY
        ${cards.column('oracle_id')},
        ${sets.column('release_date')} DESC NULLS LAST,
        ${cards.column('id')} DESC
    `
    : raw('');

  return sql`
    WITH candidate_cards AS MATERIALIZED (
      SELECT *
      FROM (
        SELECT ${uniqueMode === 'cards' ? sql`DISTINCT ON (${cards.column('oracle_id')})` : raw('')}
          ${cards.column('id')},
          ${cards.column('oracle_id')},
          CASE
            WHEN ${params.q ?? null}::text IS NULL THEN 0::real
            ELSE similarity(${cards.column('name_normalized')}, lower(${params.q ?? null}::text))
          END AS search_rank,
          ${cards.column('name')},
          ${cards.column('set_code')},
          ${cards.column('collector_number')},
          ${cards.column('mana_value')},
          ${sets.column('release_date')}
        FROM ${cards.source}
        LEFT JOIN ${sets.source} ON ${sets.column('code')} = ${cards.column('set_code')}
        WHERE ${cardPredicates(params)}
        ${uniqueCardOrder}
      ) filtered_cards
      ORDER BY ${candidateOrder(orderMode, orderDirection)}
      LIMIT ${limit}::int
      OFFSET ${offset}::int
    )
  `;
}

function fastUniqueNameCandidateQuery(options: CardCandidateQueryOptions): SqlFragment {
  const {
    params,
    orderMode,
    orderDirection,
    limit,
    offset,
  } = options;

  return sql`
    WITH candidate_cards AS MATERIALIZED (
      SELECT
        ${cards.column('id')},
        ${cards.column('oracle_id')},
        0::real AS search_rank,
        ${cards.column('name')},
        ${cards.column('set_code')},
        ${cards.column('collector_number')},
        ${cards.column('mana_value')},
        ${sets.column('release_date')}
      FROM ${cards.source}
      LEFT JOIN ${sets.source} ON ${sets.column('code')} = ${cards.column('set_code')}
      WHERE ${and([
        tokenPredicate(cards.alias, params),
        typePredicateForCard(cards.alias, params.type, 'a_type'),
        legalityPredicate(params.format, params.legality, cards.alias),
        notExists(select('1')
          .from(otherCards.source)
          .join(sql`
            LEFT JOIN ${otherSets.source}
              ON ${otherSets.column('code')} = ${otherCards.column('set_code')}
          `)
          .where(and([
            eq(otherCards.column('oracle_id'), cards.column('oracle_id')),
            tokenPredicate(otherCards.alias, params),
            typePredicateForCard(otherCards.alias, params.type, 'a2_type'),
            legalityPredicate(params.format, params.legality, otherCards.alias),
            sql`(
              coalesce(${otherSets.column('release_date')}, DATE '-infinity')
                > coalesce(${sets.column('release_date')}, DATE '-infinity')
              OR (
                coalesce(${otherSets.column('release_date')}, DATE '-infinity')
                  = coalesce(${sets.column('release_date')}, DATE '-infinity')
                AND ${otherCards.column('id')} > ${cards.column('id')}
              )
            )`,
          ]))),
      ])}
      ORDER BY ${candidateOrder(orderMode, orderDirection)}
      LIMIT ${limit}::int
      OFFSET ${offset}::int
    )
  `;
}
