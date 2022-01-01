import fetch from 'node-fetch';

import { THIRD_PARTY } from '@packages/magic';

/**
 * Temporary workaround for fetch-h2 opinions.
 */
const {
  GRAPHQL_PATH,
  SearchTags: _SearchTags,
  FetchTag: _FetchTag
} = THIRD_PARTY.scryfall.TAGGER;

export const SearchTags = async ({ page = 1, headers }) => {
  const input = { page, type: 'ORACLE_CARD_TAG' };
  return await fetch(GRAPHQL_PATH, _SearchTags({ headers, input }))
    .then(res => res.json());
}

export const FetchTag = async ({ page = 1, slug, headers }) => {
  const input = { page, type: "ORACLE_CARD_TAG", slug };
  return await fetch(GRAPHQL_PATH, _FetchTag({ headers, input }))
    .then(res => res.json());
}