import { getParams } from './../../url-query';
import { paramAliases } from '.';

// Parse and reformat event types from query string.
export const parseEventTypes = (query) => {
  return getParams(query, ...paramAliases.event_type)
    .map(obj => {
      const text = obj
        .replaceAll(' ', '-')
        ?.match(/[a-zA-Z-]+/g)
        .map(x =>
          x.split(/-/g)
          .map(_obj => _obj.charAt(0).toUpperCase() + _obj.slice(1)).join(' ')
        ).flat(1);
      return text.join('');
    });
}