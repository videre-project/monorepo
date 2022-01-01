export const API_PATH = 'https://api.scryfall.com/';
export const DOCS_PATH = 'https://scryfall.com/docs/';

/*
* Irregular layouts that don't belong to regular tournament-legal cards.
* Refer to https://scryfall.com/docs/api/layouts for additional layouts.
*/
export const ignoredLayouts = [
  'planar',               // Plane and Phenomenon-type cards
  'scheme',               // Scheme-type cards
  'vanguard',             // Vanguard-type cards
  'token',                // Token cards
  'double_faced_token',   // Tokens with another token printed on the back
  'emblem',               // Emblem cards
  'augment',              // Cards with Augment
  'host',                 // Host-type cards
  'art_series',           // Art Series collectable double-faced cards
  'double-sided'          // A Magic card with two sides that are unrelated
];

/**
 * Special set types don't contain regular tournament-legal cards.
 * Refer to https://scryfall.com/docs/api/sets for additional set types.
 */
export const ignoredSetTypes = [
  'masterpiece', // Masterpiece Series premium foil cards
  'arsenal', // A Commander-oriented gift set
  'from_the_vault', // From the Vault gift sets
  'spellbook', // Spellbook series gift sets
  'premium_deck', // Premium Deck Series deck
  'duel_deck', // Duel Decks
  'treasure_chest', // Magic Online treasure chest prize sets
  'vanguard',     // Vanguard card sets
  'funny',        // A funny un-set or set with funny promos (Unglued, Happy Holidays, etc)
  'promo', // A set that contains purely promotional cards
  'token',        // A set made up of tokens and emblems.
  'memorabilia',   // A set made up of gold-bordered, oversize, or trophy cards that are not legal
];