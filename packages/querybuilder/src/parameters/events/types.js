import { toPascalCase } from "@packages/database";
import { MTGO } from '@packages/magic';

// Parse and reformat event types from query string.
export const parseEventTypes = (event_types) => {
  const _event_types = typeof event_types == 'object'
    ? event_types
    : [event_types];
  const parsedTypes = _event_types
    .map(type => {
      const matched = type
        .replaceAll(' ', '-')
        ?.match(/[a-zA-Z-]+/g)
      return MTGO.EVENT_TYPES
        .filter(_type => {
          _type.toLowerCase() == matched.join('').toLowerCase()
        });
    }).flat(1)
    .filter(Boolean)
    .map(toPascalCase);
  return typeof event_types == 'object'
    ? parsedTypes
    : parsedTypes?.[0];
}

export default parseEventTypes;