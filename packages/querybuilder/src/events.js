import { MTGO } from '@packages/magic';
import { sql, pruneObjectKeys } from '@packages/database';

import { toPascalCase } from '.';
import { getParams, removeDuplicates } from './url-query';

export const paramAliases = {
  format: ['f', 'fmt', 'format'],
  event_type: ['t', 'type', 'event_type'],
  time_interval: ['i', 'int', 'interval', 'time_interval'],
  offset: ['o', 'ofs', 'offset'],
  min_date: ['min', 'min_date', 'min-date'],
  max_date: ['max', 'max_date', 'max-date'],
  uids: ['id', 'uid', 'uids', 'event', 'event_id', 'eventID']
}

// Parse and reformat event formats from query string.
export const parseFormats = (query) => {
  return getParams(query, ...paramAliases.format).map(obj => {
    const text = obj?.match(/[a-zA-Z-]+/g).join('');
    return text.charAt(0).toUpperCase() + text.slice(1);
  });
}

// Parse and reformat event types from query string.
export const parseEventTypes = (query) => {
    return getParams(query, ...paramAliases.event_type).map(obj => {
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

// Format prettified dates from query string.
export const parseDateRange = (_min_date, _max_date, offset) => {
    const min_date =
        _min_date?.length && (_min_date?.split(/(?:\/|-)+/) || []).length == 3
            ? new Intl.DateTimeFormat('en-US').format(
                new Date(new Date(_min_date?.replace(/-/g, '/'))).getTime() +
                (offset ? parseInt(offset) : 0) * (8.64 * 10 ** 7)
            )
            : undefined;
    const max_date =
        _max_date?.length && (_max_date?.split(/(?:\/|-)+/) || []).length == 3
            ? new Intl.DateTimeFormat('en-US').format(
                new Date(new Date(_max_date?.replace(/-/g, '/'))).getTime() -
                (offset ? parseInt(offset) : 0) * (8.64 * 10 ** 7)
            )
            : offset?.length
            ? new Intl.DateTimeFormat('en-US').format(
                new Date().getTime() - parseInt(offset) * (8.64 * 10 ** 7)
            )
            : undefined;
    return { min_date, max_date };
}

// Parse and pre-validate 'uids' parameter
export const parseUIDS = (query, uids) => {
  return (uids || getParams(query, ...paramAliases.uids))
    .map(id => [...id.split(',')].map(_id => _id.match(/[0-9]+/g).join('')) || null)
    .flat(1)
    .filter(Boolean);
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

/**
 * Queries database, accepts parameters and array of uids to filter events from.
 */
export const eventsQuery = async (query, uids) => {
  const {
    format,
    type,
    uids,
    time_interval,
    offset,
    min_date,
    max_date,
    _min_date, _max_date // original (unparsed) args
  } = parseEventParams(query, uids);

  const eventData = await sql.unsafe(`
    SELECT * FROM events
    WHERE uid IN (
        SELECT uid FROM events
        WHERE ${[
          `format in (${(format?.length
            ? format
            : MTGO.FORMATS.map(obj => toPascalCase(obj?.match(/[a-z]+/gi).join('')))
          ).map(obj => `'${obj}'`)
            .join()})`,
          `type in (${(type?.length
            ? type
            : MTGO.EVENT_TYPES.map(obj => {
                const text = obj
                  ?.match(/[a-zA-Z-]+/g)
                  .map(x => x.split(/-/g).map(toPascalCase).join(' '))
                  .flat(1);
                return text.join('');
              })
          ).map(obj => `'${obj}'`)
            .join()})`,
          !isNaN(time_interval)
            ? `date::DATE ${min_date && !max_date ? '<=' : '>='} ${
                min_date && !max_date
                  ? `'${min_date}'::DATE`
                  : max_date
                  ? `'${max_date}'::DATE`
                  : 'CURRENT_DATE'
              } ${min_date && !max_date ? '+' : '-'} ${time_interval}::INT`
            : '',
          min_date ? `date::DATE >= '${min_date}'::DATE` : '',
          max_date ? `date::DATE <= '${max_date}'::DATE` : '',
          uids?.length ? `uid IN (${uids.map(_uid => `${_uid}::INTEGER`)})` : '',
        ].filter(Boolean)
          .join(' AND ')}
    ) ORDER BY date::DATE DESC, uid DESC;
  `);

  return {
    parameters: pruneObjectKeys({
      [format?.length == 1 ? 'format' : 'formats']:
        format?.length == 1 ? format[0] : format,
      [type?.length == 1 ? 'type' : 'types']: type?.length == 1 ? type[0] : type,
      time_interval: time_interval,
      offset,
      min_date: _min_date,
      max_date: _max_date,
      uids: [...new Set(uids)].filter(uid =>
        [...new Set(eventData.map(obj => obj.uid.toString()))].includes(uid.toString())
      ),
    }),
    data: eventData,
  };
};
