import fetch from 'node-fetch';

import { sql, dynamicSortMultiple, pruneObjectKeys, calculateEventStats } from '@videre/database';
import { MTGO } from '@videre/magic';
import { getParams, getQueryArgs, groupQuery, eventsQuery } from '@videre/querybuilder';

const Charts = async (req, res) => {
  // Get event catalog and parsed parameters.
  const { _, data: request_1 } = await eventsQuery(req.query, null);

  // Get event results from event catalog.
  const request_2 = await sql.unsafe(`
    SELECT * from results
    WHERE event in (${request_1.map(obj => obj.uid)});
  `);

  // Parse archetype decklists for valid cards.
  const cards = request_2
    .map(obj =>
      [
        ...obj.deck?.mainboard.map(_obj => ({
          cardname: _obj.cardName,
          quantity: _obj.quantity,
          container: 'mainboard',
        })),
        ...obj.deck?.sideboard.map(_obj => ({
          cardname: _obj.cardName,
          quantity: _obj.quantity,
          container: 'sideboard',
        })),
      ].map(_obj => ({
        uid: null, // cards-database uid
        ..._obj,
        deck_uid: obj.uid,
        archetype_uid: obj.archetype_uid,
        displayName: obj.displayName,
        event: obj.event,
      }))
    ).filter(Boolean)
    .flat(1);

  const timeseries = [...new Set(request_1.map(({ date }) => date))]
    .map(date => {
      const eventUIDS = request_1
        .filter(({ date: _date }) => _date == date)
        .map(({ uid }) => uid);
      const cardData = cards
        .filter(({ event }) => eventUIDS.includes(event));

      return [...new Set(cards.map(({ cardname }) => cardname))]
        .filter(Boolean)
        .sort()
        .map(name => {
          const included = [...new Set(cardData
            .filter(({ cardname }) => cardname == name)
            .map(({ deck_uid }) => deck_uid))];

          const other = [...new Set(cardData.map(({ deck_uid }) => deck_uid))]
            // .filter(id => !included.includes(id));

          if (!included.length) return;
          else return {
            cardname: name,
            date,
            count: included.length,
            meta: (included.length / other.length) * 100
          };
        }).filter(Boolean)
        .sort((a, b) => (new Date(a.count) < new Date (b.count) ? 1 : -1));
    }).flat(1);

    return res.status(200).json({
      data: cards.filter(
        (obj, i) =>
          cards.findIndex(_obj => _obj.cardname === obj.cardname) === i
      ).map(obj => {
        const filtered = timeseries
          .filter(({ cardname }) => cardname == obj.cardname);
        const countData = Object.fromEntries(filtered
          .map(({ date, meta }) => [date, meta]));

        return {
          cardname: obj.cardname,
          count: filtered
            .map(({ count }) => count)
            .reduce((a, b) => a + b, 0),
          countData,
        }
      }).sort((a, b) => (new Date(a.count) < new Date (b.count) ? 1 : -1))
    });
}

export default Charts;