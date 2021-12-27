import { getParams } from './../../url-params';
import { paramAliases } from '.';

// Parse and reformat event formats from query string.
export const parseFormats = (query) => {
  return getParams(query, ...paramAliases.format)
    .map(obj => {
      const text = obj?.match(/[a-zA-Z-]+/g).join('');
      return text.charAt(0).toUpperCase() + text.slice(1);
    });
}