import { toPascalCase } from "@videre/database";
import { MTGO } from '@videre/magic';

/**
 * Parse and reformat event types from query string.
 * @param {String|Array.<String>} event_types any event type(s)
 * @returns {String|Array.<String>} matched event type(s).
 * @example parseEventTypes('modern') -> 'Modern'
 * @example parseEventTypes(['foo', 'legacy', 'pauper']) -> ['Legacy', 'Pauper']
 */
export const parseEventTypes = (event_types) => {
  const _event_types = Array.isArray(event_types)
    ? event_types
    : [event_types];
  const parsedTypes = _event_types
    .map(type => {
      const matched = type
        ?.replaceAll(' ', '-')
        ?.match(/[a-zA-Z-]+/g)
        ?.join('')
        ?.toLowerCase();
      return MTGO.EVENT_TYPES
        .map(_type => _type.toLowerCase())
        .filter(_type => _type == matched);
    }).flat(1)
    .filter(Boolean)
    .map(toPascalCase);
  return Array.isArray(event_types)
    ? parsedTypes
    : parsedTypes?.[0];
}

export default parseEventTypes;