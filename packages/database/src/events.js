import { sql } from '.';

/**
 * Validates integrity of event results on results table by uid.
 * @param {*} _uids Array of event ids
 */
export const check_integrity = async (_uids) => {
    // Parse uids to prevent sql injection.
    const uids = _uids.map(id => `${id}`.match(/[0-9]+/g).join(''));
    // Get event results from event catalog.
    const results = await sql.unsafe(`
      SELECT * from results
      WHERE event in (${uids || []});
    `);
    // Check for duplicate entries.
    const duplicates = results
      .map(obj => [obj.username, obj.url, obj.deck])
      .map((obj, i, _obj) => _obj.indexOf(obj) !== i && i)
      .filter(obj => results[obj])
      .map(obj => results[obj][uid]);
    // Check for malformed results by event id.
    const malformed_entries = [...new Set(results.map(obj => obj.event))]
      .map(id => {
        const rank_arr = (results
          .filter(obj => obj?.event == id))
          .map(obj => obj?.stats?.rank || 0)
          .sort((a, b) => a - b);
        for(var i = 1; i < rank_arr.length; i++) {
          // If a nonconsecutive sequence is found,
          // the event entry is assumed to be malformed.
          if(rank_arr[i] - rank_arr[i-1] != 1) {
            return id;
          } else return;
        }
      }).filter(Boolean);
    return {
      duplicates,
      malformed_entries,
      incomplete_entries: results.filter(obj => obj.archetype === {})
    };
  }