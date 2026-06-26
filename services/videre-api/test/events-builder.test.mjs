import assert from 'node:assert/strict';
import test from 'node:test';

import postgres from 'postgres';

import {
  buildDecksQuery,
  buildEventsQuery,
  buildMatchesQuery,
} from '../src/db/queries/events/buildEventQueries.ts';
import { getDeckStatistics } from '../src/db/queries/events/getDeckStatistics.ts';
import { getMatchupMatrix } from '../src/db/queries/events/getMatchupMatrix.ts';
import { getMetagame } from '../src/db/queries/events/getMetagame.ts';

const sql = postgres({
  host: process.env.PGHOST ?? '127.0.0.1',
  port: Number(process.env.PGPORT ?? 6432),
  database: process.env.PGDATABASE ?? 'mtgo',
  username: process.env.PGUSER ?? 'api',
  password: process.env.PGPASSWORD ?? 'replace_with_a_strong_password',
  ssl: process.env.PGSSL === 'true' ? 'require' : false,
  transform: {
    undefined: null,
  },
});

test.after(async () => {
  await sql.end({ timeout: 5 });
});

test('event builders return events, decks, and matches for a real event', async () => {
  const [candidate] = await sql`
    SELECT e.id, e.format, e.date
    FROM Events e
    WHERE EXISTS (
      SELECT 1
      FROM Decks d
      INNER JOIN Archetypes a ON a.deck_id = d.id
      WHERE d.event_id = e.id
        AND a.archetype_id IS NOT NULL
    )
      AND EXISTS (
      SELECT 1
      FROM Matches m
      WHERE m.event_id = e.id
    )
      AND EXISTS (
        SELECT 1
        FROM Matches m
        INNER JOIN Decks d1 ON d1.event_id = m.event_id
                           AND d1.player = m.player
        INNER JOIN Decks d2 ON d2.event_id = m.event_id
                           AND d2.player = m.opponent
        INNER JOIN Archetypes a1 ON a1.deck_id = d1.id
        INNER JOIN Archetypes a2 ON a2.deck_id = d2.id
        WHERE m.event_id = e.id
          AND a1.archetype_id IS NOT NULL
          AND a2.archetype_id IS NOT NULL
          AND a1.archetype != a2.archetype
      )
    ORDER BY e.date DESC, e.id DESC
    LIMIT 1
  `;

  assert.ok(candidate);

  const events = await run(buildEventsQuery({ event_id: candidate.id }));
  assert.equal(events.length, 1);
  assert.equal(events[0].id, candidate.id);

  const filteredEvents = await run(buildEventsQuery({
    format: candidate.format,
    min_date: candidate.date,
    max_date: candidate.date,
  }));
  assert.ok(filteredEvents.some((event) => event.id === candidate.id));

  const decks = await run(buildDecksQuery({ event_id: candidate.id }));
  assert.ok(decks.length > 0);
  assert.ok(decks.every((deck) => deck.archetype_id !== null));

  const matches = await run(buildMatchesQuery({ event_id: candidate.id }));
  assert.ok(matches.length > 0);
  assert.ok(matches.every((match) => match.event_id === candidate.id));
  assert.ok(matches.every((match) => typeof match.games === 'string'));

  const metagame = await getMetagame(sql, { event_id: candidate.id });
  assert.ok(metagame.length > 0);
  assert.ok('match_winrate' in metagame[0]);

  const archetypes = await getDeckStatistics(sql, { event_id: candidate.id });
  assert.ok(archetypes.length > 0);
  assert.ok(Array.isArray(archetypes[0].mainboard));
  assert.ok(Array.isArray(archetypes[0].sideboard));

  const matchups = await getMatchupMatrix(sql, { event_id: candidate.id });
  assert.ok(matchups.length > 0);
  assert.ok(Array.isArray(matchups[0].matchups));
});

async function run(query) {
  return sql.unsafe(query.text, [...query.values]);
}
