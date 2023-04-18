import { calculateEventStats } from '../../swiss.js';

/**
 * Get approx total players and swiss distribution per event.
 * @param {Array.<object>} request_2 Results query
 * @returns {Array.<object>}
 */
export function eventRecords (request_2) {
  return [...new Set(request_2.map(obj => obj.event))]
    .map(uid => {
      const records = request_2
        .filter(obj => obj.event == uid)
        .map(obj => obj?.stats?.record);
      const recordData = [...new Set(records)]
        .map(record => ({
          record,
          count: records.filter(_record => _record == record).length,
        }))
        .sort((a, b) =>
          parseInt(b.record.split('-')[0])
          - parseInt(a.record.split('-')[0])
        );
      return {
        [uid]: calculateEventStats(recordData),
      };
    })
    .flat(1)
    .reduce((a, b) => ({ ...a, ...b }));
};

export default eventRecords;