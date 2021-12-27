import { toPascalCase } from "@packages/database";
import { MTGO } from '@packages/magic';

// Parse and reformat event formats from query string.
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