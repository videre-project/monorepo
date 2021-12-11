import { FORMATS } from './constants';

const excludedFormats = [
  'alchemy',
  'brawl',
  'historic',
];

/**
 * Magic: The Gathering Online supported formats, sanctioned event types, colors, card types, etc.
 */
export const MTGO = {
  FORMATS: FORMATS.filter(format => !excludedFormats.includes(format)),
  EVENT_TYPES: [
    'mocs',
    'preliminary',
    'challenge',
    'champs',
    'premier',
    'super-qualifier',
    'players-tour-qualifier',
    'showcase-challenge',
  ],
};