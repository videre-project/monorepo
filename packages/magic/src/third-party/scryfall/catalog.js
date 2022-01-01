import { fetch } from 'fetch-h2';

import { filterCollection } from './collection';
import { API_PATH } from './constants.js';

/**
 * Fetches bulk cards data from Scryfall.
 */
export const fetchBulkData = async ({ type, catalog_uri, filter = false }) => {
  // Get Scryfall oracle catalog data
  const catalog = await fetch(catalog_uri || `${API_PATH}bulk-data/${type}`)
    .then(res => res.json());
  // Get oracle card data
  const data = await fetch(catalog.download_uri)
    .then(res => res.json());
  
  if (filter) return filterCollection(data);
  else return data;
};