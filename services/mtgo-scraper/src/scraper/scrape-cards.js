import { dynamicSortMultiple } from '@packages/database';

import { FIRST_PARTY, THIRD_PARTY } from '@packages/magic';

const { injectCardProps, formatCardObjects } = FIRST_PARTY.cards;
const { getAtomicData, getSetData } = THIRD_PARTY.mtgjson;
const { fetchBulkData } = THIRD_PARTY.scryfall;

import { getTagsData } from './../utils/tags';

/**
 * Formats an array of Scryfall card objects or a Scryfall collection
 * object into a pruned first-party sets/cards/tags collection object.
 */
export const formatCardsCollection = async ({ collection, page }) => {
  // Get all set printings and granular type props.
  const atomic_json = await getAtomicData({ type: 'Cards' });

  // Get Scryfall tagger data w/ tag metadata.
  const { tags, cards } = await getTagsData(page);

  // Parse aggregate card properties.
  const card_catalog = (collection
    // Get Scryfall oracle-cards data if none provided.
  || await fetchBulkData({ type: 'oracle-cards', filter: true })
  ).map(obj => ({
    ...obj,
    // Inject MTGJSON card props.
    ...injectCardProps(atomic_json, obj.name, 'types'),
    ...injectCardProps(atomic_json, obj.name, 'supertypes'),
    ...injectCardProps(atomic_json, obj.name, 'subtypes'),
    ...injectCardProps(atomic_json, obj.name, 'printings'),
    // Inject Tagger data.
    tags: cards
      .filter(({ uid }) => uid == obj.oracle_id)
      ?.[0]
      ?.tags,
  }));

  // Filter and pretty format set and card data
  const setData = await getSetData({ card_catalog, filter: true });
  const cardData = formatCardObjects(card_catalog, setData);

  // Filter unique tags included after card catalog filtering.
  const uniqueTags = [...new Set(
    card_catalog
      .filter(({ tags }) => tags?.length)
      .map(({ tags }) => tags.map(({ uid }) => uid))
      .flat(2)
  )];
  const tagData = tags
    .filter(({ uid }) => uniqueTags.includes(uid))
    .sort(dynamicSortMultiple('count', 'unique', 'displayName'));

  return { sets: setData, cards: cardData, tags: tagData };
}