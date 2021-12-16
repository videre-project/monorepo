import { fetch } from 'fetch-h2';

import { API_PATH } from './constants.js';

/**
 * Get MTGJSON 'atomic' data
 */
export const getAtomicData = async type => {
  const data = await fetch(`${API_PATH}Atomic${type}.json`).then(res => res.json());
  return data.data;
};