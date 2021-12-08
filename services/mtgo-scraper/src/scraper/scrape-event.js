import chalk from 'chalk';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { setDelay } from '@packages/database';

/**
 * Scrapes an event from MTGO standings by URI.
 *
 * @param {String} uri Event URI.
 */
export const scrapeWotCEvent = async uri => {
  /**
   * Queries a deck element for cards.
   *
   * @param {Element} group Parent group element.
   * @param {String} query Section query.
   */
  const queryDeckSection = (group, query) =>
    Array.from(group.querySelectorAll(`${query} .row`)).map(cardElement => {
      const quantity = parseInt(cardElement.querySelector('.card-count').textContent, 10);
      const cardname = cardElement.querySelector('.card-name').textContent.trim();

      return { quantity, cardname };
    });
  try {
    // Fetch page and create document context
    const eventURL = `https://magic.wizards.com/en/articles/archive/mtgo-standings/${uri}`;
    const response = await fetch(eventURL);
    if (response.status !== 200) throw new Error(response.status);

    // Create document context
    const html = await response.text();
    const { document } = new JSDOM(html).window;

    // Get basic event information
    // [format, type, event, , date]
    const groupTitle =
      document
        .querySelector('span.deck-meta h5')
        ?.textContent.replace(/#/g, '')
        .replace(' on', '')
        .trim()
        .split(' ') || [];

      const format = groupTitle[0];
      const date = groupTitle[groupTitle.length - 1];
      const event = groupTitle[groupTitle.length - 2];

      groupTitle.splice(0, 1);
      groupTitle.splice(groupTitle.length - 2, 2);

      const type = groupTitle.join(' ');

    // Early return if no standings available
    const hasStandings = document.querySelector('table.sticky-enabled');
    if (!hasStandings) return;

    // Get player standing stats
    const standings = Array.from(
      document.querySelectorAll('table.sticky-enabled tbody tr')
    ).reduce((output, entry) => {
      const [rank, username, points, OMWP, GWP, OGWP] = Array.from(
        entry.querySelectorAll('td')
      ).map(elem => {
        // Parse numbers if present, otherwise capital string
        const content = elem.textContent.trim();
        return isNaN(content) ? content.toUpperCase() : Number(content);
      });

      // Create standing object
      output.push({ rank, username, points, OMWP, GWP, OGWP });

      return output;
    }, []);

    // Calculate rounds by top 3 win ceiling
    const [first, ...rest] = standings.slice(0, 2).sort((a, b) => b.points - a.points);
    const extraRound = rest.every(({ points }) => points === first.points);
    const winCeil = first.points / 3;
    const rounds = winCeil + (extraRound ? 1 : 0);

    // Parse deck groups for player meta, decks
    const players = Array.from(document.querySelectorAll('.deck-group')).reduce(
      (output, group, i) => {
        // Get basic player information
        const url = `${eventURL}#${group.id}`;
        const username = group.querySelector('h4').textContent.replace(/\s\(.+/, '');

        // Parse container rows for cards
        const mainboard = queryDeckSection(group, '.sorted-by-overview-container');
        const sideboard = queryDeckSection(group, '.sorted-by-sideboard-container');

        // Calculate player stats
        const { points, _rank, OMWP, GWP, OGWP } = standings.find(
          standing => standing.username.toString().toUpperCase() === username.toUpperCase()
        );
        const wins = points / 3;
        const losses = rounds - wins;
        const record = `${wins}-${losses}`;
        // Get rank at index 'i' in standings to correct for shift in results after top 8
        const rank = standings[i].rank;

        // Create player object
        output.push({
          username,
          url,
          event,
          deck: {
            mainboard,
            sideboard,
          },
          stats: {
            record,
            points,
            rank,
            OMWP,
            GWP,
            OGWP,
          },
        });

        return output;
      },
      []
    );

    // Return if players output is empty (malformed).
    if (!players?.length) return;

    return {
      uid: event,
      uri,
      format,
      type,
      date,
      players,
    };
  } catch (error) {
    console.error(chalk.red(`Error: ${uri} - ${error.message}`));
  }
};

/**
 * 
 * @param {*} page 
 * @param {*} format 
 * @param {*} type 
 * @param {*} uid 
 * @returns 
 */
export const scrapeGoldfishEvent = async (page, format, type, uid) => {
    // Create Goldfish-specific uid from event uid.
    const uri = `${format}-${type}-${uid}`;
    try {
        await page.goto(`https://www.mtggoldfish.com/tournament/${uri}`, { waitUntil: 'domcontentloaded' },);

        // Get archetypes (groups) from metagame breakdown table.
        let archetypes = await page.evaluate(() => {
            return Array.from(
                document.querySelectorAll([
                    'div.deck-display-right-contents',
                    'table.table:nth-child(2)',
                    'tr', 'td', 'a[href]'
                ].join(' '))
            ).map(a => {
                if (!a?.innerText || ['Total', 'Other'].includes(a?.innerText)) return;
                return {
                    uid: parseInt(
                        a.getAttribute('href')
                         .split('/archetype/')[1]
                    ),
                    displayName: a.innerText,
                };
            }).filter(Boolean);
        });
        // Return if archetype labels haven't been processed.
        if (!archetypes?.length) {
          console.log(`   ${chalk.yellow('Note')}: No MTGGoldfish archetypes labels were found.`);
          console.log(`         It's possible this page doesn't yet exist.\n`);
          console.log(`>  Skipping label collection...`);
          await setDelay(1000); return;
        }

        // Get list of player results.
        let players = await page.evaluate((uri) => {
            return Array.from(
                document.querySelectorAll([
                    'div.deck-display-left-contents',
                    'table.table-tournament',
                    'tr', 'td', 'a[href]'
                ].join(' '))
            ).reduce((a, b, i, array) => {
                if (i % 3 === 0)
                    a.push(array.slice(i, i + 2));
                    return a;
            }, []).map(p => {
                if (p[0].innerText == 'Other') return;
                return {
                    event_uid: uri,
                    player: p[1].innerText,
                    deck_uid: parseInt(
                        p[0].getAttribute('href')
                            .split('/deck/')[1]
                    )
                };
            }).filter(Boolean);
        }, uri);

        // Scrape Goldfish decklist meta for each player.
        for (let i = 0; i < players?.length; i++) {
            await setDelay(1000);
            process.stdout.write('\x1Bc');
            console.log(`>> Scraping ${uri}@${players[i].player}... (${i + 1}/${players.length})`);

            await page.goto(
                `https://www.mtggoldfish.com/deck/${players[i].deck_uid}`,
                { waitUntil: 'domcontentloaded' },
            );

            const deck = await page.evaluate(() => {
                const archetype = document
                    .querySelector('.deck-container-information > a:nth-child(8)')
                    ?.innerText;
                const displayName = document
                    .querySelector('h1.title')
                    ?.childNodes[0]?.nodeValue
                    .replaceAll('\n', '');
                return {
                    archetype: archetype,
                    displayName: displayName,
                };
            });
            // Find deck archetype (group).
            let archetype = archetypes
                .find(obj => obj.displayName == deck.archetype)
                || { uid: null, displayName: null };

            // Update player entry with archetype meta.
            players[i] = {
                ...players[i],
                displayName: deck.displayName,
                alias: deck.displayName !== archetype.displayName
                    ? [archetype.displayName]
                    : [],
                archetype_uid: archetype.uid,
            };
        }
        
        return players;
    } catch (error) {
        console.error(chalk.red(`${format}-${type}-${uid} - ${error.stack}`));
    }
}