import { express } from '@videre/querybuilder';
const { getParams } = express;

export function parseUIDS(query) {
  const _uids = getParams(query, 'id', 'uid', 'uids', 'event', 'event_id');
  const uids = _uids
    ?.map(id =>
      id
        .split(',')
        .map(_id =>
          _id
            .match(/[0-9]+/g)
            .join('')
        )
    )?.flat(1)
    ?.filter(Boolean);

  if (_uids.length && !uids?.length) {
    return null;
  }
};

export default parseUIDS;