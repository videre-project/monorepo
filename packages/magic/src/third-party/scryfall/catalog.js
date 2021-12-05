import fetch from 'node-fetch';

import { API_PATH, ignoredLayouts, ignoredSetTypes } from './constants.js';

/**
 * Fetches bulk cards data from Scryfall.
 */
export const fetchBulkData = async (type, catalog_uri) => {
    // Get Scryfall oracle catalog data
    const catalog = await fetch(catalog_uri || `${API_PATH}bulk-data/${type}`).then(res => res.json());
    // Get oracle card data
    const data = await fetch(catalog.download_uri).then(res => res.json());
    return data;
}

/**
 * Filters non-sanctioned card entries and null card properties.
 */
export const filterCatalog = (data) => {
    return data
        .filter(card => 
            // Exclude extraneous card layouts and set types from non-sanctioned formats
            !ignoredLayouts.includes(card.layout) &&
            !ignoredSetTypes.includes(card.set_type) &&
            // Exclude new cards from previews / etc not yet legal but will be in the future.
            !(card.legalities.future == 'legal' &&
                Object.values(card.legalities).filter(x => x == 'legal').length == 1) &&
            // Remove null card object placeholders for back-halves of double-faced cards.
            !(card.layout != 'normal' && !card.oracle_text && !card.power && !card.loyalty)
        // Alphabetical sort data by cardname
        ).sort((a, b) => a.name.localeCompare(b.name));
}