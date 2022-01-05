import { toPascalCase } from "@videre/database";
import { MTGO } from '@videre/magic';

/**
 * Parse and reformat event formats from query string.
 * @param {String|Array.<String>} event_types any format(s)
 * @returns {String|Array.<String>} matched format(s).
 * @example parseEventTypes('challenge') -> 'Challenge'
 * @example parseEventTypes(['foo', 'challenge', 'super-qualifier']) -> ['Challenge', 'Super Qualifier']
 */
export const parseFormats = (formats) => {
  const _formats = Array.isArray(formats)
    ? formats
    : [formats];
  const parsedFormats = _formats
    .map(format => {
      const matched = format
        ?.match(/[a-zA-Z-]+/g)
        ?.join('')
        ?.toLowerCase();
      return MTGO.FORMATS
        .map(_format => _format.toLowerCase())
        .filter(_format => _format == matched);
    }).flat(1)
    .filter(Boolean)
    .map(toPascalCase);
  return Array.isArray(formats)
    ? parsedFormats
    : parsedFormats?.[0];
}

export default parseFormats;