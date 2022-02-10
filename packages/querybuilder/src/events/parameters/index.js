import { getParams, removeDuplicates } from './../../parameters/express/params.js';

import { parseDateRange } from './dates';
import { parseEventTypes } from './event-types';
import { parseUIDS } from './event-uids';
import { parseFormats } from './formats';

export const paramAliases = {
  format: ['f', 'fmt', 'format'],
  event_type: ['t', 'type', 'event_type'],
  time_interval: ['i', 'int', 'interval', 'time_interval'],
  offset: ['o', 'ofs', 'offset'],
  min_date: ['min', 'min_date', 'min-date'],
  max_date: ['max', 'max_date', 'max-date'],
  uids: ['id', 'uid', 'uids', 'event', 'event_id', 'eventID']
}

export const parseEventParams = (query, uids) => {
  // Enumerate and parse arguments from query.
  const format = parseFormats(query);
  const type = parseEventTypes(query);
  const uids = parseUIDS(query, uids);

  // Remove duplicates from query parameters.
  const params = removeDuplicates(query);
  
  const time_interval = !uids?.length
    ? parseInt(getParams(params, ...paramAliases.time_interval)[0])
      || 2 * 7
    : undefined;

  // Format prettified dates from query string.
  const offset = getParams(params, ...paramAliases.offset)[0];
  const _min_date = getParams(params, ...paramAliases.min_date)[0];
  const _max_date = getParams(params, ...paramAliases.max_date)[0];
  const { min_date, max_date } = parseDateRange(_min_date, _max_date, offset);
  
  return { format, type, uids, time_interval, offset, min_date, max_date, _min_date, _max_date };
}

export default parseEventParams;