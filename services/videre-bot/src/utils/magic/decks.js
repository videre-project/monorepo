import { COLORS, CARD_TYPES, COMPANIONS } from '@videre/magic';
import { groupBy, dynamicSortMultiple } from '@videre/database';

import { manamoji } from './manamoji';


/**
 * Gets unique colors in a scryfall collection for card sorting.
 * @param {Array.<Object>} collection An array of scryfall card objects.
 * @param {*} client 
 * @returns {String}
 */
export const getColors = (collection, client) => {
  // Get unique colors for each card (or each card face)
  const data = collection.map(({ name, image_uris, colors, card_faces }, i) => {
    // Exclude companion colors for sorting sideboards..
    if (COMPANIONS.includes(name)) return [ 'C' ];
    return image_uris // Indicates whether double-sided.
      // Get front-face colors if one-sided.
      ? !colors.length
        ? [ 'C' ]
        : colors
      : [ // Otherwise get colors for each card side
        ...(!card_faces[0].colors.length)
          ? [ 'C' ]
          : card_faces[0].colors,
        ...(!card_faces[1].colors.length)
          ? [ 'C' ]
          : card_faces[1].colors
      // Discard duplicate colors.
      ].filter((item, pos, self) => self.indexOf(item) == pos)
  }).flat(1);

  // Remove duplicates from set
  let colorsArray = [...new Set(
      data.filter(function(item, pos) {
      return data;
      // Only keep colors that occur more than once
      // return data.indexOf(item) !== data.lastIndexOf(item);
      }).flat(1)
  )];

  // Remove colorless symbol from array if other colors are present
  if (colorsArray.includes('C') && colorsArray.length > 1) {
    colorsArray = colorsArray.filter(item => item !== 'C');
  }

  // Sort mana by positional indexes for sorting in WUBRG order and format as {W}{U}{B}{R}{G}
  colorsArray = colorsArray
    .map(c => COLORS.indexOf(c))
    .sort();
  const colors = manamoji(
    client,
    `{${colorsArray.map(i => COLORS[i]).join('}{')}}`
  );

  return colors;
}


/**
 * Formats Scryfall collection and decklist object into sorted array / embed fields.
 */
export const formatDeck = (json, deck, emojiGuild, mode) => {
  const data = json.map(({ name, color_identity, cmc, image_uris, colors, type_line, mana_cost, card_faces, layout }, i) => {
    let front_face_props = [];
    switch(image_uris) {
      // Get properties of front face for double-sided or split cards
      case undefined:
        front_face_props = {
          image: card_faces[0].image_uris.png,
          colors: [
            ...(!card_faces[0].colors.length) ? [ 'C' ] : card_faces[0].colors,
            ...(!card_faces[1].colors.length) ? [ 'C' ] : card_faces[1].colors
          ].filter((item, pos, self) => self.indexOf(item) == pos),
          display_type: card_faces[0].type_line,
        };
        break;
      default:
        front_face_props = {
          image: image_uris.png,
          colors: (!colors.length) ? [ 'C' ] : colors,
          display_type: type_line
        };
        break;
    }

    CARD_TYPES.forEach((type) => {
      if (i + 1 > deck.mainboard.length) {
        if (COMPANIONS.includes(name)) {
          front_face_props.display_type = 'Companion';
        } else front_face_props.display_type = 'Sideboard';
      } else if (front_face_props.display_type.includes('Land')) {
        front_face_props.display_type = 'Land';
      } else if (front_face_props.display_type.includes(type)) {
        front_face_props.display_type = type;
      }
    });

    // if (mana_cost) {
    //   const _mana_cost = manamoji(emojiGuild, mana_cost);
    //   front_face_props.mana_cost = layout !== 'split' ? _mana_cost.split('//')[0] : _mana_cost;
    // }

    return {
      name: layout !== 'split' ? name.split('//')[0] : name,
      qty: [ ...(deck?.mainboard || []), ...(deck?.sideboard || []) ][i].quantity,
      color_identity: (!color_identity.length) ? [ 'C' ] : color_identity,
      cmc: cmc,
      ...front_face_props
    };
  });
  
  const groupedData = groupBy(data, card => card.display_type);
  let array = [];
  [ 'Companion', ...CARD_TYPES, 'Sideboard' ].forEach((type) => {
    if (data.some(card => card.display_type == type)) {
      const subsetData = groupedData.get(type)
        .map(({ color_identity, colors, ...rest }, i) => {
          return {
            colors: colors.map(c => COLORS.indexOf(c)),
            color_identity: color_identity.map(c => COLORS.indexOf(c)),
            ...rest
          };
        })
        // Sorting Method 1
        .sort(dynamicSortMultiple('cmc', 'colors', '-qty', 'color_identity', 'name'))
        // Scryfall Sorting Method
        // .sort(dynamicSortMultiple('cmc', 'name'))
        .map(({ colors, color_identity, ...rest }) => {
          return {
            colors: `{${colors.map(i => COLORS[i]).join('}{')}}`,
            color_identity: `{${color_identity.map(i => COLORS[i]).join('}{')}}`,
            ...rest
          };
        });
      switch (mode) {
        case 'decklist':
          const subsetSum = Array.from(subsetData.reduce(
            (m, {display_type, qty}) => m.set(display_type, (m.get(display_type) || 0) + qty), new Map
          ), ([display_type, qty]) => qty);
          array.push({
            name: `${type == 'Sideboard' ? type : (type == 'Sorcery' ? 'Sorceries' : type + 's')} (${subsetSum})`,
            value: subsetData
              .map(({ qty, name }) => `**${qty}** ${name}`)
              .join('\n'),
            inline: type == 'Land' || type == 'Sideboard'
              ? true
              : false
          });
          break;
        default:
          array = [...array, ...subsetData];
          break;
      }
    }
  });
  return array;
};