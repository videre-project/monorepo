import { MTGO } from '@videre/magic';
import { sql, prisma, pruneObjectKeys } from '@videre/database';

import { parseEventParams } from './parameters';

export const toPascalCase = text => text.charAt(0).toUpperCase() + text.slice(1);

const eventQuery = async (query) => {
  const {
    format,
    type,
    uids,
    time_interval,
    offset,
    min_date,
    max_date,
    _min_date, _max_date // original (unparsed) args
  } = parseEventParams(query);

  const eventData = await prisma.Events.findMany({
    where: {
      AND: [
        { date: { gte: new Date(min_date) } },
        { date: { lte: new Date(max_date) } }
      ]
    }
  });
}
