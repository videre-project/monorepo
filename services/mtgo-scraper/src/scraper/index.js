import chalk from 'chalk';

import { parseTime, CLI_CLEAR_CONSOLE } from '@packages/cli';
import { setDelay } from '@packages/database';

import { generateEventURIs, addEventEntry, updateEventEntry, checkDatabaseEntries } from './../utils/database';
import { getDates } from './../utils/dates';
import usePuppeteerStealth from './puppeteer';
import { scrapeWotCEvent, scrapeGoldfishEvent } from './scrape-event';

const run = async (args) => {
  try {
    // Create date range.
    const dates = getDates(args);

    // Get incomplete and complete event results from results table.
    const { incomplete, complete } = await checkDatabaseEntries(dates, true);

    // Create URIs for event queue.
    const queue = generateEventURIs(dates)
      // Skip URI if event entry already exists.
      .filter(uri => !complete.includes(uri));

    // Setup Puppeteer
    const { browser, page } = await usePuppeteerStealth();

    // Fetch events synchronously to avoid request timeout.
    CLI_CLEAR_CONSOLE();
    console.log('>> Scraping WotC Events...');
    const startTime = Date.now();
    for (let i = 0; i < queue.length; i++) {
      await setDelay(500);
      const uri = queue[i];

      // Output current progress to console.
      CLI_CLEAR_CONSOLE();
      const progress = (((i + 1) / queue.length) * 100).toFixed(2);
      console.log(`>> Scraping '${chalk.yellow(uri)}'...`);
      console.log(`   Progress: ${progress}% (${i + 1}/${queue.length}) complete.`);
      const queueRate = (Date.now() - startTime) / (1000 * (i + 1)); // in seconds
      if (i) console.log(`   About ${parseTime((queue.length - (i + 1)) * queueRate)} remaining.\n`);
      else console.log('   Calculating time remaining...\n');

      // Event exists but is missing third-party archetype labels.
      if (incomplete.map(obj => obj.uri).includes(uri)) {
        console.log(`   ${chalk.yellow('Note')}: This database entry already exists, but is`);
        console.log(`         missing third-party archetype labels.\n`);
        // Deconstruct event uri.
        const format = uri.split('-')[0];
        const type = uri.split('-').slice(1,-3).join('-');
        // Find event uid.
        const { event: uid } = incomplete.filter(obj => obj.uri == uri)[0];
        // Update only Goldfish archetype.
        const goldfishData = await scrapeGoldfishEvent(page, format, type, uid);
        if (!goldfishData) continue;
        await updateEventEntry(null, null, goldfishData);
      } else {
        // Scrape WotC and Goldfish page.
        const { players, ...event } = await scrapeWotCEvent(uri) || {};
        if (JSON.stringify(event) === '{}')  {
          console.log(`   This event does not exist.\n>  Skipping event...`);
          continue;
        }
        const goldfishData = await scrapeGoldfishEvent(page, event.format, event.type, event.uid);
        // Create new database entry.
        await addEventEntry(players, event, goldfishData);
      }
    }

    // Cleanup
    await page.close();
    await browser.close();
    await setDelay(500);

    CLI_CLEAR_CONSOLE();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red(error.stack));
    process.exit(1);
  }
};

export default run;