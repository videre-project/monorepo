import chalk from 'chalk';
import fetch from "node-fetch";

import { MessageActionRow, MessageAttachment, MessageButton } from 'discord.js';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import{ toPascalCase } from '@videre/database';

// import { sql } from 'utils/database';
// import { getNumberWithOrdinal, getColors, formatEvent, formatDeck, drawDeck } from 'utils/magic';
import { getColors, formatDeck, drawDeck } from 'utils/magic';

import config from 'config';
import { ERROR_DEFAULTS, ERROR_MESSAGE, x_button } from 'constants';

const Decklist = {
  name: 'decklist',
  description: "(WIP) Displays decklist(s) by url or filtered by format, archetype, player, and/or by query.",
  type: 'global',
  options: [
    {
      name: 'decklist_url',
      description: 'Any url to a publically accessible deck page.',
      type: 'string',
      required: true,
    },
  ],
  async execute({ client, interaction, args }) {
    // For buttons interaction
    const { mode } = args;

    const decklist_url = args?.decklist_url
      || interaction?.message
          ?.components[0]
          ?.components[1]
          .url;

    try {
      if (!decklist_url) {
        return { ...ERROR_DEFAULTS, description: `No \`decklist_url\` provided.` };
      }

      if (mode !== undefined) await interaction.deferUpdate();
      else if (interaction) await interaction.deferReply();

      let [author, title, deck, decklist] = [{}, '{COLORS} **Unknown** by Unknown', [], {}];
      let [footer, timestamp] = [{}, undefined];
      let deck_button = new MessageButton()
        .setStyle('LINK')
        .setLabel('Open Deck Page')
        .setURL(decklist_url);

      if (decklist_url.includes('magic.wizards.com/en/articles/archive/mtgo-standings/')) {
        return {
          embeds: [{
            ...ERROR_DEFAULTS,
          description: 'Unable to establish a connection with querybuilding service.\nPlease try again later.',
          }],
          components: [new MessageActionRow().addComponents(x_button())],
          deferred: true
        };

        // const request = await sql`SELECT * from results WHERE url = ${decklist_url};`;

        // const date = await sql`SELECT date from events WHERE uid = ${request[0].event}::int;`;
        // const format = await sql`SELECT format from events WHERE uid = ${request[0].event}::int;`;
        // const archetype = request[0]?.archetype[Object.keys(request[0]?.archetype)[0]]?.displayName;
        // const username = request[0]?.username;
        
        // author = {
        //   name: formatEvent(request[0].url.split("#")[0], request[0].event, date[0].date),
        //   url: request[0].url.split('#')[0],
        //   // icon_url: 'https://pbs.twimg.com/profile_images/1338652703141064705/HrYZlNwV_400x400.jpg'
        // };
        // title = [
        //   `${getNumberWithOrdinal(request[0].stats.rank)} place (${request[0].stats.record})`,
        //   `{COLORS} **${archetype ? archetype : 'Unknown'}** by ${username ? username : 'Unknown'}`,
        // ].join('\n');
        // timestamp = new Date(new Date(date[0].date).toUTCString()).toISOString();
        // footer = { text: `Format: ${format[0].format}` };
        // decklist = request[0].deck;
      }
      else {
        puppeteer.use(StealthPlugin());
        
        const browser = await puppeteer.launch({ headless: true });
        const page = (await browser.pages())[0];

        await page.setRequestInterception(true);

        page.on('request', (request) => {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
          request.abort();
        else
          request.continue();
        });

        if (decklist_url.includes('mtggoldfish.com/deck/')) {
          author = {
            name: 'MTGGoldfish.com • User Submitted Deck',
            url: 'https://mtggoldfish.com/',
            icon_url: 'https://pbs.twimg.com/profile_images/572281574326947840/NM8e-RHn_400x400.png'
          };
          const id = decklist_url.match(/(\d+)/g).join('');
          const _decklist_url = `https://www.mtggoldfish.com/deck/${id}`;
          await page.goto(_decklist_url);

          deck_button = new MessageButton()
            .setStyle('LINK')
            .setLabel('Open Goldfish Page')
            .setURL(_decklist_url)
            .setEmoji('924696249054158859'); // :Goldfish: mtggoldfish emoji

          deck = await page.evaluate(decklist_url => {
            const id = decklist_url.match(/(\d+)/g).join('');
            const download_url = `https://www.mtggoldfish.com/deck/download/${id}`;
            return window.fetch(download_url, {
              method: 'GET',
              credentials: 'include'
            }).then(res => res.text())
              .then(text => `${JSON.stringify(text.trim())}`
                .replace('"','').toLowerCase()
                .split('\\n\\r\\n')
              );
          }, decklist_url);

          [author, title] = await page.evaluate(() => {
            const event = document.querySelector('p.deck-container-information > a')?.childNodes[0]?.nodeValue;

            const archetype = document.querySelector('h1.title')?.childNodes[0]?.nodeValue.replaceAll('\n', '');
            const username = document.querySelector('h1.title span.author')?.childNodes[0]?.nodeValue.replaceAll('\n', '');
            const title = `{COLORS} **${archetype ? archetype : 'Unknown'}** ${username ? username : 'Unknown'}`;

            return [
              {
                name: `MTGGoldfish.com • ${event ? event.split('by')[0].replaceAll('\n', '') : 'User Submitted Deck'}`,
                url: 'https://mtggoldfish.com/',
                icon_url: 'https://pbs.twimg.com/profile_images/572281574326947840/NM8e-RHn_400x400.png'
              },
              title
                ? title
                : '{COLORS} **Unknown** by Unknown',
            ];
          });
          timestamp = await page.evaluate(() => {
            const p = document.querySelector('p.deck-container-information').innerHTML;
            const date = p.substring(p.lastIndexOf("Deck Date:") + 11).split('<br>')[0].trim();
            return new Date(new Date(date).toUTCString()).toISOString();
          });
          footer = {
            text: await page.evaluate(() => {
              const p = document.querySelector('p.deck-container-information').innerHTML;
              const format = p.substring(p.lastIndexOf("Format:") + 8).split('<br>')[0].trim();
              return `Format: ${format}`;
            }),
          };
        } else if (decklist_url.includes('scryfall.com/') && decklist_url.includes('/decks/')) {
          author = {
            name: 'Scryfall.com • User Submitted Deck',
            url: 'https://scryfall.com/',
            icon_url: 'https://pbs.twimg.com/profile_images/1411204019285069826/fXLLDUPo_400x400.jpg',
          };

          const uid = decklist_url
            .split('/decks/')[1]
            .replace('\/','')
            .split('?')[0];
          const download_url = `https://api.scryfall.com/decks/${uid}/export/text`;
          deck = await fetch(download_url)
            .then(res => res.text())
            .then(text => `${JSON.stringify(text.trim())}`
              .replace('"','').toLowerCase()
              .replace('// sideboard\\r\\n', '')
              .split('\\n\\r\\n')
            );

          const user = decklist_url
            .split('scryfall.com/@')[1]
            .split('/decks/')[0]

          const _decklist_url = `https://scryfall.com/@${user}/decks/${uid}`;

          deck_button = new MessageButton()
            .setStyle('LINK')
            .setLabel('Open Scryfall Page')
            .setURL(_decklist_url)
            .setEmoji('924336738170703963'); // :Scryfall: scryfall emoji

          await page.goto(`${_decklist_url}?as=list`);
          title = await page.evaluate(() => {
            const username = document.querySelector('p.sidebar-account-summary-item').innerHTML.split('@')[1].trim();
            const archetype = document.querySelector('h1.deck-details-title')?.childNodes[0]?.nodeValue;
            return `{COLORS} **${archetype}** by ${username.replaceAll('</strong>', '')}`;
          });
          timestamp = await page.evaluate(() => {
            return new Date(new Date(Date.parse(
              document.querySelector('p.deck-details-subtitle')
                // .getAttribute('title')
                // .replace(' ', 'T')
                .innerHTML
                .split('<abbr title="')[1]
                .split('">')[0]
              + '+0000')
            ).toUTCString()).toISOString();
          });
          footer = {
            text: await page.evaluate(() => {
              const format = document.querySelector('.deck-details-subtitle > strong')?.innerText
              return format
                ? `Format: ${format}`
                : 'Format: None';
            }),
          };
        } else if (decklist_url.includes('tappedout.net/mtg-decks/')) {
          author = { name: 'TappedOut.net • User Submitted Deck', url: 'https://tappedout.net/' };
          deck_button = new MessageButton()
            .setStyle('LINK')
            .setLabel('Open Tappedout Page')
            .setURL(decklist_url);
            // .setEmoji('924336738170703963'); // :Scryfall: scryfall emoji

          await page.goto(decklist_url);

          deck = await page.evaluate(decklist_url => {
            const uri = decklist_url.split('tappedout.net/mtg-decks/')[1];
            const download_url = `https://tappedout.net/mtg-decks/${uri}?fmt=txt`;
            return window.fetch(download_url, {
              method: 'GET',
              credentials: 'include'
            }).then(res => res.text())
              .then(text => `${JSON.stringify(text.trim())}`
                .replace('"','').toLowerCase()
                .replace('sideboard:\\r\\n', '')
                .split('\\n\\r\\n')
              );
          }, decklist_url);

          title = await page.evaluate(() => {
            const archetype = document.querySelector('.well-jumbotron > h2:nth-child(3)').innerHTML.trim();
            const username = document.querySelector('.well-jumbotron > p:nth-child(5) > a').innerHTML.trim();
            return `{COLORS} **${archetype}** by ${username.replaceAll('</strong>', '')}`;
          });
        } else if (decklist_url.includes('moxfield.com/') && decklist_url.includes('/decks/')) {
          author = {
            name: 'MoxField.com • User Submitted Deck',
            url: 'https://moxfield.com/',
            icon_url: 'https://www.moxfield.com/favicon.png',
          };

          const uid = decklist_url
            .split('/decks/')[1]
            .replace('\/','')
            .split('?')[0];

          const response = await fetch(`https://api.moxfield.com/v2/decks/all/${uid}`)
            .then(res => res.json());

          deck = await fetch(`https://api.moxfield.com/v1/decks/all/${uid}/download?exportId=${response.exportId}&arenaOnly=false`)
            .then(res => res.text())
            .then(text => `${JSON.stringify(text.trim())}`
              .replace('"','').toLowerCase()
              .replace('sideboard:\\r\\n', '')
              .split('\\n\\r\\n')
            );
          
          deck_button = new MessageButton()
            .setStyle('LINK')
            .setLabel('Open MoxField Page')
            .setURL(`https://moxfield.com/decks/${uid}`)
            .setEmoji('926302804686016522'); // :MoxField: moxfield emoji

          title = `{COLORS} **${response.name}** by ${response.createdByUser.userName}`;

          timestamp = response.lastUpdatedAtUtc || response.createdAtUtc;

          footer = {
            text: response.format
              ? `Format: ${toPascalCase(response.format)}`
              : 'Format: None'
          };

        }
          // else if (decklist_url.includes('mtgdecks.net/')) {
          //     author = { name: 'MTGDecks.net • User Submitted Deck', url: 'https://mtgdecks.net/' };

          //     // await page.goto(decklist_url);
          //     // const cookies = await page.cookies();

          //     // deck = await page.evaluate((decklist_url, cookies) => {
          //     //     const uri = decklist_url.split('mtgdecks.net/')[1];
          //     //     const download_url = `https://mtgdecks.net/${uri}/txt`;
          //     //     return window.fetch(download_url, {
          //     //         method: 'GET',
          //     //         credentials: 'include'
          //     //     }).then(res => res.text())
          //     //         .then(text => `${JSON.stringify(text.trim())}`
          //     //             .replace('"','').toLowerCase()
          //     //             .replace('sideboard\\r\\n', '')
          //     //             .split('\\n\\r\\n')
          //     //         );
          //     // }, decklist_url, cookies);

          //     // const test = await page.evaluate(() => {
          //     //     // const archetype = document.querySelector('.well-jumbotron > h2:nth-child(3)').innerHTML.trim();
          //     //     // const username = document.querySelector('.well-jumbotron > p:nth-child(5) > a').innerHTML.trim();
          //     //     // return `{COLORS} **${archetype}** by ${username.replaceAll('</strong>', '')}`;

          //     //     return document.querySelector('div.content > h1').innerHTML.trim()//.split(', BY');
          //     // });

          //     // console.log(test);
          // }
          else return {
            deferred: true,
            embeds: [{ ...ERROR_DEFAULTS, description: `Deck site not currently supported.` }],
          };

          await page.close();
          await browser.close();

          // Create decklist object
          decklist = {
            mainboard: deck?.[0]?.length
              ? deck[0].split('\\r\\n').map(card => (
                  {
                    quantity: parseInt(card.split(' ')[0]),
                    cardName: card.substring(card.indexOf(' ') + 1).replace('\\r','')
                  }
                ))
              : [],
            sideboard: deck?.[1]?.length
              ? deck[1].split('\\r\\n').map(card => (
                {
                  quantity: parseInt(card.split(' ')[0].match(/(\d+)/)[0]),
                  cardName: card.substring(card.indexOf(' ') + 1).replace('\\r','')
                }
              ))
              : [],
          };
      }
      
      // Get Scryfall card data
      const collection = await fetch("https://api.scryfall.com/cards/collection", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "identifiers": [
            ...decklist.mainboard.map(({ cardName }) => ({ "name": cardName.split('/')[0] })),
            ...decklist.sideboard.map(({ cardName }) => ({ "name": cardName.split('/')[0] })),
          ],
        }),
      }).then(res => res.json());

      if (collection?.error) return {
        embeds: [{
          ...ERROR_DEFAULTS,
          description: collection.details
            .replace('`identifiers`', 'provided decklist')
            .replace('references', 'cards')
        }],
        deferred: true
      }

      const buffer = !Boolean(mode)
        ? await drawDeck(
          formatDeck(
            collection.data,
            decklist,
            client.guilds.resolve(config.emojiGuild)
          )
        ) : null;

      const fields = Boolean(mode)
        ? formatDeck(
            collection.data,
            decklist,
            client.guilds.resolve(config.emojiGuild),
            'decklist'
          )
        : null;

      const button = new MessageButton()
        .setStyle('PRIMARY')
        .setLabel(!Boolean(mode)
          ? 'Show Text Decklist'
          : 'Show Visual Decklist',
        ).setCustomId(JSON.stringify({
          mode: !Boolean(mode),
        })).setEmoji(!Boolean(mode)
          ? '837140782820622346' // :manat: tap emoji
          : '837140782804500490' // :manaq: untap emoji
        );

      const embed = {
        author: author,
        title: title
          .replace('{COLORS}', getColors(collection.data, client.guilds.resolve(config.emojiGuild))),
        url: decklist_url.replace('https//', 'https://'),
        fields,
        image: buffer
          ? { url: 'attachment://canvas.png' }
          : null,
        footer: footer ? footer : {},
        timestamp: timestamp
          ? timestamp 
          : undefined
      };

      // Send follow-up response
      return {
        embeds: [embed],
        files: buffer
          ? [new MessageAttachment(buffer, 'canvas.png')]
          : null,
        components: [new MessageActionRow().addComponents(button, deck_button)],
        deferred: Boolean(interaction)
      };
    } catch (error) {
      console.error(
        chalk.white(
          `${chalk.blue(`[/Decklist]`)} args: [ ${[
            `${chalk.grey(`decklist_url:`)} ${!decklist_url ? 'None' : chalk.green(`"${decklist_url}"`)}`,
          ].join(', ')} ]\n>> ${chalk.red(error.stack)}`
        )
      );
      return ERROR_MESSAGE('An error occured while fetching decklist data.', error, interaction);
    }
  },
};

export default Decklist;