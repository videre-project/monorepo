import { MTGO } from '@packages/magic';
import { sql, pruneObjectKeys } from '@packages/database';

import { getParams, removeDuplicates } from './url-query';

const paramAliases = {
    format: ['f', 'fmt', 'format'],
    event_type: ['t', 'type', 'event_type'],
    time_interval: ['i', 'int', 'interval', 'time_interval'],
    offset: ['o', 'ofs', 'offset'],
    min_date: ['min', 'min_date', 'min-date'],
    max_date: ['max', 'max_date', 'max-date'],
    uids: ['id', 'uid', 'uids', 'event', 'event_id', 'eventID']
}

export const toPascalCase = text => text.charAt(0).toUpperCase() + text.slice(1);

// Parse and format event types from query string.
const parseEventTypes = () => {
    return getParams(query, 't', 'type', 'event_type').map(obj => {
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
const parseDateRange = (_min_date, _max_date, offset) => {
    const min_date =
        _min_date?.length && (_min_date?.match('///g') || []).length == 2
            ? new Intl.DateTimeFormat('en-US').format(
                new Date(new Date(_min_date?.replace(/-/g, '/'))).getTime() +
                (offset ? parseInt(offset) : 0) * (8.64 * 10 ** 7)
            )
            : undefined;
    const max_date =
        _max_date?.length && (_max_date?.match('///g') || []).length == 2
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
const parseUIDS = () => {
  const _uids = getParams(req.query, 'id', 'uid', 'uids', 'event', 'event_id', 'eventID');
  const uids = _uids
    .map(id => [...id.split(',')].map(_id => _id.match(/[0-9]+/g).join('')) || null)
    .flat(1)
    .filter(Boolean);
  if (_uids.length && !uids?.length) {
    return res.status(400).json({
      details: `No valid 'eventID' ${
        uids?.length == 1 ? 'parameter' : 'parameters'
      } provided.`,
    });
  }
}

const parseEventParams = (query) => {
    const params = removeDuplicates(query);

    // Enumerate and parse arguments from query.
    const _format = getParams(query, 'f', 'fmt', 'format').map(obj => {
        const text = obj?.match(/[a-zA-Z-]+/g).join('');
        return text.charAt(0).toUpperCase() + text.slice(1);
    });
    const _type = getParams(query, 't', 'type', 'event_type').map(obj => {
        const text = obj
            .replaceAll(' ', '-')
            ?.match(/[a-zA-Z-]+/g)
            .map(x =>
                x.split(/-/g)
                .map(_obj => _obj.charAt(0).toUpperCase() + _obj.slice(1)).join(' ')
            ).flat(1);
        return text.join('');
  });
  const _time_interval = parseInt(
    getParams(params, 'i', 'int', 'interval', 'time_interval')[0]
  );
  const offset = getParams(params, 'o', 'ofs', 'offset')[0];
  const _min_date = getParams(params, 'min', 'min_date', 'min-date')[0];
  const _max_date = getParams(params, 'max', 'max_date', 'max-date')[0];

  const time_interval = uids?.length ? undefined : _time_interval || 2 * 7;

  // Format prettified dates from query string.
  const min_date =
    _min_date?.length && (_min_date?.match('///g') || []).length == 2
      ? new Intl.DateTimeFormat('en-US').format(
          new Date(new Date(_min_date?.replace(/-/g, '/'))).getTime() +
            (offset ? parseInt(offset) : 0) * (8.64 * 10 ** 7)
        )
      : undefined;
  const max_date =
    _max_date?.length && (_max_date?.match('///g') || []).length == 2
      ? new Intl.DateTimeFormat('en-US').format(
          new Date(new Date(_max_date?.replace(/-/g, '/'))).getTime() -
            (offset ? parseInt(offset) : 0) * (8.64 * 10 ** 7)
        )
      : offset?.length
      ? new Intl.DateTimeFormat('en-US').format(
          new Date().getTime() - parseInt(offset) * (8.64 * 10 ** 7)
        )
      : undefined;

    return { }
}

/**
 * Queries database, accepts parameters and array of uids to filter events from.
 */
export const eventsQuery = async (query, uids) => {
  const params = removeDuplicates(query);

  // Enumerate and parse arguments from query.
  const _format = getParams(query, 'f', 'fmt', 'format').map(obj => {
    const text = obj?.match(/[a-zA-Z-]+/g).join('');
    return text.charAt(0).toUpperCase() + text.slice(1);
  });
  const _type = getParams(query, 't', 'type', 'event_type').map(obj => {
    const text = obj
      .replaceAll(' ', '-')
      ?.match(/[a-zA-Z-]+/g)
      .map(x =>
        x
          .split(/-/g)
          .map(_obj => {
            return _obj.charAt(0).toUpperCase() + _obj.slice(1);
          })
          .join(' ')
      )
      .flat(1);
    return text.join('');
  });
  const _time_interval = parseInt(
    getParams(params, 'i', 'int', 'interval', 'time_interval')[0]
  );
  const offset = getParams(params, 'o', 'ofs', 'offset')[0];
  const _min_date = getParams(params, 'min', 'min_date', 'min-date')[0];
  const _max_date = getParams(params, 'max', 'max_date', 'max-date')[0];

  const time_interval = uids?.length ? undefined : _time_interval || 2 * 7;

  // Format prettified dates from query string.
  const min_date =
    _min_date?.length && (_min_date?.match('///g') || []).length == 2
      ? new Intl.DateTimeFormat('en-US').format(
          new Date(new Date(_min_date?.replace(/-/g, '/'))).getTime() +
            (offset ? parseInt(offset) : 0) * (8.64 * 10 ** 7)
        )
      : undefined;
  const max_date =
    _max_date?.length && (_max_date?.match('///g') || []).length == 2
      ? new Intl.DateTimeFormat('en-US').format(
          new Date(new Date(_max_date?.replace(/-/g, '/'))).getTime() -
            (offset ? parseInt(offset) : 0) * (8.64 * 10 ** 7)
        )
      : offset?.length
      ? new Intl.DateTimeFormat('en-US').format(
          new Date().getTime() - parseInt(offset) * (8.64 * 10 ** 7)
        )
      : undefined;

  const eventData = await sql.unsafe(`
    SELECT * FROM events
    WHERE uid IN (
        SELECT uid FROM events
        WHERE ${[
          `format in (${(_format?.length
            ? _format
            : MTGO.FORMATS.map(obj => toPascalCase(obj?.match(/[a-z]+/gi).join('')))
          )
            .map(obj => `'${obj}'`)
            .join()})`,
          `type in (${(_type?.length
            ? _type
            : MTGO.EVENT_TYPES.map(obj => {
                const text = obj
                  ?.match(/[a-zA-Z-]+/g)
                  .map(x => x.split(/-/g).map(toPascalCase).join(' '))
                  .flat(1);
                return text.join('');
              })
          )
            .map(obj => `'${obj}'`)
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
        ]
          .filter(Boolean)
          .join(' AND ')}
    ) ORDER BY date::DATE DESC, uid DESC;
  `);

  return {
    parameters: pruneObjectKeys({
      [_format?.length == 1 ? 'format' : 'formats']:
        _format?.length == 1 ? _format[0] : _format,
      [_type?.length == 1 ? 'type' : 'types']: _type?.length == 1 ? _type[0] : _type,
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
