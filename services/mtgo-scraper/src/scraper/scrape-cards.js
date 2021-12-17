import fetch from 'node-fetch';

import { setDelay } from '@packages/database';
import { FIRST_PARTY, THIRD_PARTY } from '@packages/magic';

const { formatCardObjects } = FIRST_PARTY.cards;
const { getAtomicData, getSetCatalog, filterSetObjects } = THIRD_PARTY.mtgjson;
const {
    API_PATH, fetchBulkData, filterCatalog,
    TAGGER: { GRAPHQL_PATH, SearchTags: _SearchTags, getTagsCatalog }
} = THIRD_PARTY.scryfall;

import { getApiCallHeaders } from './puppeteer';

const SearchTags = async ({ page = 1, headers }) => {
    const input = { name: null, page, type: "ORACLE_CARD_TAG" };
    return await fetch(GRAPHQL_PATH, _SearchTags({ headers, input }))
        .then(res => res.json());
}

const formatTags = (self, filter = true) => {
    return self
        .flat(1)
        .filter(({ status }) =>
            status === 'GOOD_STANDING'
        ).map(tag => {
            const type = tag.type == 'ORACLE_CARD_TAG'
                ? 'oracletag'
                : 'art';
            return {
                uid: tag.id,
                name: tag.slug,
                displayName: tag.name,
                description: tag.description,
                type,
                url: `${API_PATH}cards/search?q=${type}=${tag.slug}`,
                category: tag.category,
                count: tag.taggingCount,
                ancestry: tag.ancestry,
                childTags: tag.childTags
            }
        }).filter(obj => !filter || obj.category || obj.count > 1)
        .sort((a, b) => (a.count < b.count ? 1 : -1));
}

export const getTagsMeta = async (page) => {
    // Extract session headers/cookie from tagger website
    const headers = await getApiCallHeaders(page, 'https://tagger.scryfall.com/');

    let json = await SearchTags({ headers });

    const { perPage, total } = json.data.tags;
    const num_pages = Math.ceil(total / perPage);

    // Enumerate tag pages
    let data = [json.data.tags.results];
    for (let i = 1; i < num_pages; i++) {
        await setDelay(1000);
        json = await SearchTags({ page: i + 1, headers });
        data.push(json.data.tags.results);
    }
    data = formatTags(data);

    return data
        .map(({ ancestry, childTags, ...rest }) => ({
            ...rest,
            ancestry: ancestry?.map(({ tag: { id } }) => id),
            childTags: childTags?.map(({ id }) => id)
        }));
}

/**
 * Formats an array of Scryfall card objects or Scryfall collection object into pruned collection object.
 */
export const formatCardsCollection = async ({ data, page }) => {
    // Get Scryfall oracle-cards data
    if (!data) data = await fetchBulkData('oracle-cards');

    // Get Scryfall tags data.
    const tags = await getTagsMeta(page);
    const tagData = await getTagsCatalog(tags);

    // Get MTGJSON 'atomic' card data.
    const atomic_json = await getAtomicData('Cards');
    const injectCardProps = (cardname, property) => ({
        [property]: [...new Set([
            ...(atomic_json?.[cardname]?.[0]?.[property] || []),
            ...(atomic_json?.[cardname]?.[1]?.[property] || [])
        ])]
    });

    // Parse aggregate card and set catalogs
    const set_catalog = await getSetCatalog();
    const card_catalog = filterCatalog(data)
        .map(obj => ({
            ...obj,
            // Inject MTGJSON card props.
            ...injectCardProps(obj.name, 'types'),
            ...injectCardProps(obj.name, 'supertypes'),
            ...injectCardProps(obj.name, 'subtypes'),
            ...injectCardProps(obj.name, 'printings'),
            // Inject Tagger data.
            tags: tagData.cards
                .filter(({ oracle_id }) => oracle_id == obj.oracle_id)
                ?.[0]
                ?.tags,
        }));

    // Filter and pretty format sets/cards/tags data
    const setData = filterSetObjects(set_catalog, card_catalog)
        .sort((a, b) => (new Date(a.date) < new Date (b.date) ? 1 : -1));
    const cardData = formatCardObjects(card_catalog, setData);
    const tagTypes = {
        categories: tags
          .filter(({ category }) => category)
          .map(({ category, count, ...rest }) => ({
            object: 'category',
            ...rest
          })).sort((a, b) => (a.name < b.name ? 1 : -1)),
        tags: tags
          .filter(({ category }) => !category)
          .map(({ category, ...rest }) => ({
            object: 'tag',
            ...rest
          })).sort((a, b) => (a.count < b.count ? 1 : -1))
    };

    return { sets: setData, cards: cardData, tags: tagTypes };
}