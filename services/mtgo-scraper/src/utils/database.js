import { CONSTANTS, sql, check_integrity, automated_db_audit } from '@videre/database';
import { MTGO } from '@videre/magic';
import { eventsQuery } from '@videre/querybuilder';

/**
 * Generates new event uris per date / format / event-type.
 * @param {Array} dates Date strings in YYYY/MM/DD format.
 */
export const generateEventURIs = (dates) => {
  return dates
    .map(date =>
      MTGO.FORMATS
        .filter(format =>
          !['commander'].includes(format)
        ).map(format => MTGO.EVENT_TYPES
          .map(type => [
              format,
              type,
              date.toISOString()
                .substring(0, 10)
            ].join('-')
          )
        )
    ).flat(2);
}

/**
 * Creates a new database entry for an event.
 */
export const addEventEntry = async ( players, event, goldfishData ) => {
  // Create new 'events' table entry.
  await sql`INSERT INTO events ${sql(event)}`;
  // Create a new 'results' table entry for each player.
  await Promise.all(
    players.map(async player => {
      const goldfishArchetype = goldfishData
        ?.find(obj => obj.player === player.username)
        || {};
      player.archetype = goldfishArchetype?.player === player.username
        ? {
          mtggoldfish: {
            uid: goldfishArchetype.archetype_uid,
            displayName: goldfishArchetype.displayName,
            alias: goldfishArchetype.alias,
            deck_uid: goldfishArchetype.deck_uid,
          },
        }
        : {};
      await sql.unsafe(`
        INSERT INTO results (${Object.keys(player)})
        VALUES (${Object.keys(player).map((_, i) => `$${i + 1}`)})`,
        Object.values(player)
          .map(v =>
            typeof v === 'string'
              ? v
              : JSON.stringify(v)
          )
      );
    })
  );
}

/**
 * Updates an existing database entry for an event.
 */
export const updateEventEntry = async ({ players, event, goldfishData }) => {
  return;
}

/**
 * Gets incomplete and complete entries from results table.
 */
export const checkDatabaseEntries = async (dates, audit = false) => {
  // Check for database data errors.
  const summary = await check_integrity({
    min_date: dates[0],
    max_date: dates.slice(-1)[0],
    verbose: audit ? 2 : null // Clear console and show results table.
  });
  if (audit) {
    // Fix database data errors.
    await automated_db_audit(summary);
  }
  return await sql.unsafe(`
    SELECT * from results
    WHERE event in (${[...new Set([
      // Enumerate all available entry uids within expanded date range.
      ...(
        await eventsQuery({
          min_date: (new Date(
              new Date(dates[0]).valueOf() - CONSTANTS.day * 5)
            ).toISOString().substring(0, 10),
          max_date: (new Date(
              new Date(dates.slice(-1)[0]).valueOf() + CONSTANTS.day * 2)
            ).toISOString().substring(0, 10)
        }).then(({ _, data: res }) => res?.map(obj => obj.uid) || [])
      ), // Enumerate all 'incomplete' entry uids.
      ...Object.keys(summary.data)
        .map(table => summary.data[table].incomplete)
        .flat(1)
    ])]});
  `).then(res => {
    const incomplete_uids = [...new Set(
      res.filter(obj =>
          JSON.stringify(obj.archetype) === '{}'
        ).map(obj => obj.event)
    )];
    return {
      incomplete: incomplete_uids
        .map(uid => ({
          uid: res.filter(obj => obj.event == uid)
            .map(obj => obj.event)[0],
          uri: res.filter(obj => obj.event == uid)
            [0].url
            .split('#')[0]
            .split('/').slice(-1)[0]
        })),
      complete: res
        .filter(obj =>
          !incomplete_uids
            .map(obj => obj.uid)
            .includes(obj.uid)
          && !incomplete_uids
            .includes(obj.event)
        ).map(obj =>
          res.filter(_obj => _obj.event == obj.event)[0]
            .url
            .split('#')[0]
            .split('/').slice(-1)[0]
        )
    };
  });
}