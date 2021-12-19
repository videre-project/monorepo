import { CLI_REMOVE_LINE, CLI_CLEAR_CONSOLE, CLI_PAUSE } from '@packages/cli';
import { eventsQuery } from '@packages/querybuilder';

import { setDelay } from '../.';
import { day } from './../constants';
import { sql } from './../postgres';
import { delete_row_uids, delete_row_duplicates } from './../postgres/functions';

/**
 * Validates integrity of event results on results table by uid.
 * @param {*} _uids Array of event ids
 */
export const check_integrity = async ({ min_date, max_date, verbose }) => {
  if (verbose) {
    await setDelay(500);
    if (Number(verbose) >= 2) CLI_CLEAR_CONSOLE();
    console.log('>> Running \`check_integrity\` script...');
  }
  
  // Get event results in an expanded date range.
  const events = await eventsQuery({
    min_date: (new Date(
        new Date(min_date).valueOf() - day * 5)
      ).toISOString().substring(0, 10),
    max_date: (new Date(
        new Date(max_date).valueOf() + day * 2)
      ).toISOString().substring(0, 10)
  }).then(({ _, data: res }) => res);

  // Get event results from results table.
  const results = await sql.unsafe(`
    SELECT * from results
    WHERE event in (${events?.map(obj => obj.uid) || []});
  `);

  const table = {
    events: {
      // Check for duplicate entries.
      duplicates: events
        .map(obj => [obj.uid, obj.url, obj.type, obj.date])
        .map((obj, i, _obj) => _obj.indexOf(obj) !== i && i)
        .filter(idx => events[idx])
        .map(idx => events[idx].uid)
        .sort((a,b) => b - a),
      // Check for malformed results by event entry.
      malformed: events
        .filter(obj =>
          !obj?.date // Indicative of WotC scraper failure.
          // Indicative of database entry transaction failure.
          || !(results.map(obj => obj.event)).includes(obj.uid)
        ).map(obj => obj.uid)
        .sort((a,b) => b - a),
      // Check for incomplete event entries.
      incomplete: events
        .map(obj =>
          Object.keys(obj)
            .map(key =>
              ['','{}','[]'].includes(JSON.stringify(obj[key]))
            ).filter(Boolean)
            .length
          ? obj.uid
          : null
        ).filter(Boolean)
        .sort((a,b) => b - a),
      // Check for missing event entries in results table.
      missing: events
      .filter(obj =>
        !results.filter(_obj => _obj.event == obj.uid)
        ? obj.uid
        : null
      ).filter(Boolean)
      .sort((a,b) => b - a)
    },
    results: {
      // Check for duplicate entries.
      duplicates: results
        .map(obj => [obj.username, obj.url, obj.deck])
        .map((obj, i, _obj) => _obj.indexOf(obj) !== i && i)
        .filter(idx => results[idx])
        .map(idx => results[idx].uid)
        .sort((a,b) => b - a),
      // Check for malformed results by event id.
      malformed: [...new Set(results.map(obj => obj.event))]
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
        }).filter(Boolean)
        .sort((a,b) => b - a),
      // Check for incomplete archetype entries.
      incomplete: events
        .map(obj => results
            .filter(_obj =>
              _obj.event == obj.uid
              && JSON.stringify(_obj.archetype) === '{}'
            )?.map(_obj => _obj.uid)
            .length
          ? obj.uid
          : null
        ).filter(Boolean)
        .sort((a,b) => b - a),
      // Check for missing event entries in results table.
      missing: events
        .map(obj =>
          !results.filter(_obj => _obj.event == obj.uid)
            ? obj.uid
            : null
        ).filter(Boolean)
        .sort((a,b) => b - a),
    }
  };

  if (verbose) {
    CLI_REMOVE_LINE();
    console.log('Results summary:');
  }

  let total_errors = 0;
  const sumReport = (keys, tables) => (tables || Object.keys(table))
    .map(a => keys.map(b => table[a][b]?.length))
    .flat(1)
    .filter(Boolean)
    .reduce((a, b) => a + b, 0);
  const types = [
    {
      labels: ['critical error', 'critical errors'],
      type: 'critical',
      keys: ['malformed', 'missing']
    },
    {
      labels: ['duplicate entry', 'duplicate entries'],
      type: 'duplicate',
      keys: ['duplicates']
    },
    {
      labels: ['incomplete entry', 'incomplete entries'],
      type: 'incomplete',
      keys: ['incomplete']
    }
  ].map(obj => {
    const errors = sumReport(obj.keys);
    if (errors) {
      total_errors += errors;
      if (verbose) console.log(`- Found ${ errors } ${ errors == 1 ? obj.labels[0] : obj.labels.slice(-1) }.`)
      Object.keys(table)
        .forEach(a => {
          const _errors = sumReport(obj.keys, [a]);
          if (_errors) console.log(`--> ${ _errors } ${ _errors == 1 ? obj.labels[0] : obj.labels.slice(-1) } in ${ a }.`)
        })
    }
    return { type: obj.type, count: errors || 0 };
  });
  if (!total_errors) console.log('No errors found.');
  else if (Number(verbose && verbose) >= 2) {
    const prettify_table = (object) => {
      Object.entries(object)
          .forEach(([k, v]) => {
              if (v && typeof v === 'object') prettify_table(v);
              if (v && typeof v === 'object' && !Object.keys(v).length || v === null || v === undefined) {
                  if (Array.isArray(object)) object.splice(k, 1);
                  else delete object[k];
                  // else object[k] = 0;
              }
          });
      return object;
  }
    console.table(prettify_table(table));
  }
  return { total_errors, types, data: table };
}

export const automated_db_audit = async (errors) => {
  if (!errors?.data) return;
  const { total_errors, types, data } = errors;
  const critical_errors = types
    .reduce((a, b) => a + b.type, 0)
    - types.filter(obj => obj.type == 'incomplete')?.[0] || 0
  if (total_errors && critical_errors > 0) {
    console.log(`   ${ total_errors } total ${ total_errors == 1 ? 'error' : 'errors' } were found.`);
    await CLI_PAUSE();
  } else console.log('   No critical errors found.\n>> Skipping...');
  for (let i = 0; i < Object.keys(data).length; i++) {
    const table = Object.keys(data)[i];
    await Promise.all([
      {
        labels: ['duplicate', 'duplicates'],
        function: delete_row_duplicates(table)
      },
      ...['malformed', 'missing']
        .map(condition => ({
          labels: [condition],
          function: delete_row_uids(table, data[table][condition])
        }))
    ].map(async obj => {
      const count = (data[table][obj.labels.slice(-1)])?.length;
      if (count) {
        CLI_CLEAR_CONSOLE();
        const prompt = `Remove ${ count } ${ count == 1 ? obj.labels[0] : obj.labels.slice(-1) } from table '${ table }'?`;
        const response = await CLI_PAUSE(prompt, '[Y/n]', null, null);
        // Reformat previous line.
        CLI_REMOVE_LINE(2);
        if (response == 'yes') {
          console.log(`>> Removing ${ count } ${ count == 1 ? obj.labels[0] : obj.labels.slice(-1) } from table '${ table }'...`);
          await setDelay(500);
          // Remove duplicate entries.
          const { count: removed } = await (obj.function);
          // Clear previous line.
          CLI_CLEAR_CONSOLE();
          console.log(`   Removed ${ removed } ${ removed == 1 ? obj.labels[0] : obj.labels.slice(-1) } from table '${ table }'.`);
          console.log('>> Proceeding...');
        } else console.log('>> Skipping...');
        await setDelay(1000);
      }
    }))
  }
}