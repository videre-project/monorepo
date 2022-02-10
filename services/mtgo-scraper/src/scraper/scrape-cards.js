import { pruneObjectKeys, dynamicSortMultiple } from '@videre/database';
import { FIRST_PARTY, THIRD_PARTY } from '@videre/magic';

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

  function buildTreeOptimize (items) {
    function getTagById(id) {
      return items
        ?.filter(({ uid }) => uid == id)
        ?.map(({ id, childTags, ...rest }) => rest)
        ?.[0];
    }
    // Construct flat node-tree.
    const tree = items
      .map(({ uid, childTags }) => {
        if (!childTags?.length) return;
        return childTags
          .map(id => ({
            uid: id,
            parentId: uid || '',
            ...(getTagById(id) || {})
          })).filter(
            ({ uid, parentId, ...rest }) =>
              Object.keys(rest)?.length
          );
      }).filter(Boolean)
        ?.flat(1);
    
    // Construct tree map
    const treeData = new Map();
    
    // Loop through each node, find its parent node, and place it in an array    
    tree.forEach(node => {
      // map has parent data, insert, no, build and insert   
      treeData.has(node.parentId)
        ? treeData.get(node.parentId).push(node)
        : treeData.set(node.parentId, [node]);
    })
  
    // Tree First Layer  
    const treeRoots = [];
    
    // Loop through each node to find its children.
    tree.forEach(node => {
      // Insert children into current node.
      node.children = (treeData.get(node.uid) || []);
      // If a node does not have a parent, insert into the first level array
      if (!node.parentId) treeRoots.push({ node });
    });
      
    // Return tree structure as object array.
    const array = Array.from(treeData, ([uid, children]) => ({
      uid, ...getTagById(uid), children
    }));
    return array;
  }
  
  let data = buildTreeOptimize(tagData);

  /**
   * Remove all specified keys from the nested tree object recursively in place.
   * 
   * @param obj The object from where you want to remove the keys
   * @param keys An array of property names (strings) to remove
   */
  const pruneTree = (obj, keys) => obj !== Object(obj)
      // Skip if not an object.
      ? obj
      // Check if object type is Array.
      : Array.isArray(obj)
        // Call function for each Object in an Array.
        ? obj.map((item) => pruneTree(item, keys))
        // Filter keys if Object.
        : Object.keys(obj)
            .filter((k) => !keys.includes(k))
            .reduce(
              (acc, x) => {
                  const value = pruneTree(obj[x], keys);
                  const object = Object.assign(acc, { [x]: value });

                  return pruneObjectKeys(object);
              },
              {}
            );
  // Remove unnecessary props after tree construction.
  data = pruneTree(data, 'parentId');

  // Show full nested data structure in console.
  const util = require('util');
  console.log(util.inspect(data, false, null, true));

  const fs = require('fs');
  const jsonData = JSON.stringify(data);
  fs.writeFile("output.json", jsonData, 'utf8', () => {});
  // process.exit(0);

  // return { sets: setData, cards: cardData, tags: tagData };
}