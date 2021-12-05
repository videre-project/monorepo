import { FORMATS } from './magic.js';

const excludedFormats = ['historic'];

/**
 * Magic: The Gathering Online supported formats, sanctioned event types, colors, card types, etc.
 */
const MTGO = {
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
  COLORS: ['C', 'W', 'U', 'B', 'R', 'G'],
  CARD_TYPES: [
    'Creature',
    'Planeswalker',
    'Artifact',
    'Enchantment',
    'Instant',
    'Sorcery',
    'Land',
  ],
  COMPANIONS: [
    'Gyruda, Doom of Depths',
    'Jegantha, the Wellspring',
    'Kaheera, the Orphanguard',
    'Keruga, the Macrosage',
    'Lurrus of the Dream-Den',
    'Lutri, the Spellchaser',
    'Obosh, the Preypiercer',
    'Umori, the Collector',
    'Yorion, Sky Nomad',
    'Zirda, the Dawnwaker',
  ],
};

export default MTGO;
