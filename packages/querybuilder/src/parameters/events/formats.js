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
  const _formats = typeof formats == 'object'
    ? formats
    : [formats];
  const parsedFormats = _formats
    .map(format => {
      const matched = format?.match(/[a-zA-Z-]+/g);
      return MTGO.FORMATS.filter(_format =>
        _format.toLowerCase() == matched.join('').toLowerCase()
      );
    }).flat(1)
    .filter(Boolean)
    .map(toPascalCase);
  return typeof formats == 'object'
    ? parsedFormats
    : parsedFormats?.[0];
}