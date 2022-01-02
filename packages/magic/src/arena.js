import { FORMATS } from './constants';

const excludedFormats = [
  'modern',
  'legacy', 
  'vintage',
  'commander',
  'pauper'
];

/**
 * Magic: The Gathering Online supported formats, sanctioned event types, colors, card types, etc.
 */
export const ARENA = {
  FORMATS: FORMATS.filter(format => !excludedFormats.includes(format)),
  // To do: validate these event types and backdate all Arena events
  EVENT_TYPES: [
    'open',
    'premier',
  ],
};