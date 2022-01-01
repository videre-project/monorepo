import { pruneObjectKeys } from '@packages/database';

import { FORMATS } from './../constants.js';

import { ignoredSetTypes } from '../third-party/scryfall/constants.js';

/**
 * Merges unique values from both card faces by property.
 * @param {String} cardname Cardname.
 * @param {String} property Object property name.
 * @returns {*} Object property.
 */
 export const injectCardProps = (data, cardname, property) => ({
  [property]: [...new Set([
    ...(data?.[cardname]?.[0]?.[property] || []),
    ...(data?.[cardname]?.[1]?.[property] || [])
  ])]
});

/**
 * Format cards collection into cards database schema.
 */
export const formatCardObjects = (self, setData) => {
  return self
    .map(card => pruneObjectKeys({
      // Evergreen Properties
      object: 'card',
      uid: card.oracle_id,
      name: card.name,
      colors: card?.colors
        // Assign cards like lands proper colorless ('C') color.
        ? (!card.colors.length ? [ 'C' ] : card.colors)
        : card.card_faces
          .map(face => face.colors.length ? [ 'C' ] : face.colors)
          .flat(1)
          // Remove duplicate colors (e.g. ['R','G','R']).
          .filter((item, pos, self) => self.indexOf(item) == pos),
      color_identity: (!card.color_identity.length)
        ? [ 'C' ]
        : card.color_identity,
      produced_mana: card?.produced_mana,
      cmc: card?.cmc,
      mana_cost: card?.mana_cost,
      power: card?.power
        ? card.power
        : (card?.card_faces ? card.card_faces.map(face => face.power) : null),
      toughness: card?.toughness
        ? card.toughness
        : (card?.card_faces ? card.card_faces.map(face => face.loyalty) : null),
      loyalty: card?.loyalty
        ? card.loyalty
        : (card?.card_faces ? card.card_faces.map(face => face.loyalty) : null),
      // May change per errata/oracle updates
      typeline: card?.type_line,
      supertypes: card?.supertypes,
      types: card?.types,
      subtypes: card?.subtypes,
      oracle_text: card?.oracle_text
        || (card.card_faces ? card.card_faces.map(face => face.oracle_text) : null),
      layout: card.layout,
      keywords: card?.keywords,
      // May update per new set release
      image: {
        printing: (card?.set || 'N/A').toUpperCase(),
        url: card?.image_uris?.png
        || card.card_faces
          .map(face => face.image_uris.png)
          .filter((item, pos, self) => self.indexOf(item) == pos),
        language: (card?.lang || 'N/A').toUpperCase(),
        high_res: card?.highres_image || false
      },
      printings: Object.fromEntries(
        [...new Set(
          [...new Set(card?.printings)]
            .map(_id =>
              setData
                .filter(obj => obj.id == _id)
                ?.[0]?.type
            ).sort()
        )].filter(type =>
          !ignoredSetTypes.includes(type)
        ).map(type => [type,
          [...new Set(card?.printings)]
            .map(_id =>
              setData
                .filter(obj => obj.id == _id && obj.type == type)
                .sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1))
                ?.[0]?.id
            ).filter(Boolean)
        ])
      ),
      // May update per B&R announcement (~16:00 UTC)
      legalities: Object.fromEntries(
        FORMATS.map(format => [format, card.legalities[format] || 'not_legal'])
      ),
      // May update daily (~03:30 UTC)
      tagger: card?.tags
        ? [...new Set(
          card.tags
            .sort((a, b) => (a.count < b.count ? 1 : -1))
            .map(({ uid, name }) => uid || name)
        )]
        : [],
    }));
}