import { MTGO } from '@videre/magic';
import { sql, pruneObjectKeys } from '@videre/database';

import { parseEventParams } from './parameters';

export const toPascalCase = text => text.charAt(0).toUpperCase() + text.slice(1);

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
          min_date
            ? `date::DATE >= '${min_date}'::DATE`
            : '',
          max_date
            ? `date::DATE <= '${max_date}'::DATE`
            : '',
          uids?.length
            ? `uid IN (${uids.map(_uid => `${_uid}::INTEGER`)})`
            : '',
        ].filter(Boolean)
          .join(' AND ')}
    ) ORDER BY date::DATE DESC, uid DESC;
  `);

  return {
    parameters: pruneObjectKeys({
      [format?.length == 1 ? 'format' : 'formats']:
        format?.length == 1
          ? format[0]
          : format,
      [type?.length == 1 ? 'type' : 'types']:
        type?.length == 1
          ? type[0]
          : type,
      time_interval,
      offset,
      min_date: min_date || _min_date,
      max_date: max_date || _max_date,
      uids: [...new Set(uids)]
        .filter(uid =>
          [...new Set(
            eventData.map(({ uid }) => uid.toString())
          )].includes(uid.toString())
        ),
    }),
    data: eventData,
  };
};
