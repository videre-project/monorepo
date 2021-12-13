import { FIRST_PARTY, THIRD_PARTY } from '@packages/magic';

const { formatCardObjects } = FIRST_PARTY.cards;
const { getAtomicData, getSetCatalog, filterSetObjects } = THIRD_PARTY.mtgjson;
const { fetchBulkData, filterCatalog, getTagsCatalog } = THIRD_PARTY.scryfall;

/**
 * Formats an array of Scryfall card objects or Scryfall collection object into pruned collection object.
 */
export const formatCardsCollection = async (data) => {
    // Get Scryfall oracle-cards data
    if (!data) data = await fetchBulkData('oracle-cards');

    // Get Scryfall tags data.
    const tagData = await getTagsCatalog();

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
            tags: tagData.cards.filter(_obj => _obj.oracle_id == obj.oracle_id)?.[0]?.tags,
        }));

    // Filter and format cards/sets data
    const setData = filterSetObjects(set_catalog, card_catalog);
    const cardData = formatCardObjects(card_catalog, setData);

    return { sets: setData, cards: cardData, tags: tagData.tags };
}