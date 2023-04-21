import { fetch } from 'fetch-h2';

import { ignoredSetTypes } from '../scryfall/constants.js';
import { API_PATH } from './constants.js';

/**
 * Get MTGJSON set data.
 */
export const getSetData = async ({ set_catalog, card_catalog, filter = false }) => {
  if (!set_catalog) {
    set_catalog = await fetch(`${API_PATH}SetList.json`)
      .then(res => res.json());
  }
  const data = [...new Set(set_catalog.data)]
    .map(obj => ({
      // object: 'set',
      id: obj.code,
      name: obj.name,
      date: obj.releaseDate,
      type: obj.type,
      size: obj?.baseSetSize || obj?.totalSetSize,
    }));

  if (filter) return filterSetObjects(data, card_catalog)
    .filter(({ type }) => !ignoredSetTypes.includes(type));
  else return data;
};

/**
 * Filter MTGJSON set data to include sets from card catalog.
 */
export const filterSetObjects = (set_catalog, card_catalog) => {
  return set_catalog.filter(obj =>
    [...new Set(
      card_catalog
        .map(obj => obj.printings)
        .flat(1)
    )].includes(obj.id)
  ).sort((a, b) => (new Date(a.date) < new Date (b.date) ? 1 : -1));
};