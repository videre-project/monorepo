import chalk from 'chalk';
import { CronJob } from 'cron';
import fetch from 'node-fetch';

import usePuppeteerStealth from './puppeteer'
import scrapeEvent from './scrapeEvent';

import { writeFileSync } from 'fs';

import { sql, check_integrity } from '@packages/database';
import { MTGO, FIRST_PARTY } from '@packages/magic';
import { eventsQuery } from '@packages/querybuilder';
const { formatCardsCollection } = FIRST_PARTY.cards;

// Create date range
const day = 1000 * 60 * 60 * 24;
const offset = day / 4;
const getDates = (startDate, endDate = new Date()) => {
  if (!startDate) return [new Date(new Date().valueOf() - offset)];

  const duration = new Date(endDate) - new Date(startDate);
  const steps = duration / day;

  return Array.from(
    { length: steps + 1 },
    (_, i) => new Date(new Date(startDate).valueOf() + day * i - offset)
  );
};

const runCron = process.argv[2] === 'cron';

const run = async () => {
  // if (process.argv.includes('--test')) {
  //   await new Promise(async (resolve) => {
  //     const json = JSON.stringify(await formatCardsCollection());
  //     writeFileSync('test-output.json', json);
  //     resolve();
  //   });
  //   process.exit(0);
  // }
  // return;
  try {
    // Create date range and daily event queue
    let args = process.argv.slice(2);
    if (process.argv[2] === 'cron') args = args.splice(args.indexOf('cron') - 2, 1);
    if (process.argv.includes('--force')) args = args.splice(args.indexOf('--force') - 2, 1);
    const dates = getDates(...args);
    const queue = MTGO.FORMATS.map(format =>
      MTGO.EVENT_TYPES.map(type => ({ format, type }))
    ).flat();

    const min_date = (new Date(new Date(dates[0]).valueOf() - day * 5));
    const max_date = (new Date(new Date(dates.slice(-1)[0]).valueOf() + day * 2));
    const events = await eventsQuery({
      min_date: min_date.toISOString().substring(0, 10),
      max_date: max_date.toISOString().substring(0, 10)
    }).then(({ _, data: results }) => results);
    
    console.log(await check_integrity(events.map(obj => obj.uid)));

    process.exit(0);
    // const query = `min_date=${ min_date.toISOString().substring(0, 10) }&max_date=${ max_date }`;
    // const response = await fetch(`https://videreproject.com/api/metagame?${query}`)
    //   .then(res => res.json());
    // const events = Object.keys(response.data)
    //   .map(format => [
    //     response
    //       .data[format]
    //       .events.data
    //       .map(event => event?.data?.length
    //         ? event.url.split('/').slice(-1)[0]
    //         : []
    //       ).filter(Boolean)
    //   ]).flat(2);

    // // Clear console
    // process.stdout.write('\x1Bc');
    // console.log('Scraping WotC Events...');
    // const startTime = Date.now();

    // // Scrape WotC events in parallel
    // let dbQueue = [];
    // let queueLength = 0;
    // let _queueLength = 0;
    // let goldfishQueue = [];
    await Promise.all(
      queue.map(async ({ format, type }) => {
        // Fetch dates synchronously to avoid timeout
        for (let i = 0; i < dates.length; i++) {
          // Scrape by URI
          const date = dates[i].toISOString().substring(0, 10);
          const uri = `${format}-${type}-${date}`;

          if (!events.includes(uri)) {
            // Add new entry
          } else {
            // Update entry
          }

          // const [_events] = await sql`SELECT * FROM events WHERE uri = ${uri}`;
          // if (_events && !process.argv.includes('--force')) {
          //   let [results] = await sql`SELECT * FROM results WHERE event = ${_events.uid}`;
          //   let archetypes = await sql`SELECT archetype FROM results WHERE event = ${_events.uid}`;
          //   archetypes = archetypes.filter(value => Object.keys(value).length !== 0);
          //   if (process.argv.includes('--force')) archetypes = [];
          //   if (results && archetypes?.length) continue;
          // }

          // const data = await scrapeEvent(uri);
          // _queueLength += 1;

          // const elapsedTime = (Date.now() - startTime) / 1000;
          // const _queueRate = elapsedTime / _queueLength;
          // const _progress = `${((_queueLength / (queue.length * dates.length))*100).toFixed(2)}%`;

          // // Get time in nearest days, hours, minutes and seconds
          // let totalSeconds = ((queue.length * dates.length) - _queueLength) * _queueRate;
          // let days = Math.floor(totalSeconds / 86400).toFixed(0);
          // let hours = Math.floor(totalSeconds / 3600).toFixed(0);
          //   totalSeconds %= 3600;
          // let minutes = Math.floor(totalSeconds / 60).toFixed(0);
          // let seconds = (totalSeconds % 60).toFixed(0);
          // // Create array of these values to later filter out null values
          // let formattedArray = totalSeconds.toFixed(0) == 0 ? ['', '', '', '0 seconds'] : [
          //   days > 0 ? `${ days } ${ (days == 1 ? 'day' : 'days') }` : ``,
          //   hours > 0 ? `${ hours } ${ (hours == 1 ? 'hour' : 'hours') }` : ``,
          //   minutes > 0 ? `${ minutes } ${ (minutes == 1 ? 'minute' : 'minutes') }` : ``,
          //   seconds > 0 ? `${ seconds } ${ (seconds == 1 ? 'second' : 'seconds') }` : ``,
          // ];
          // const timeRemaining = formattedArray
          //   .filter(Boolean)
          //   .join(', ')
          //   // Replace last comma with ' and' for fluency
          //   .replace(/, ([^,]*)$/, ' and $1');

          // if (data) {
          //   let [events] = await sql`SELECT * FROM events WHERE uid = ${data.uid}`;
          //   let [results] = await sql`SELECT * FROM results WHERE event = ${data.uid}`;

          //   let archetypes = await sql`SELECT archetype FROM results WHERE event = ${data.uid}`;
          //   archetypes = archetypes.filter(value => Object.keys(value).length !== 0);
          //   if (process.argv.includes('--force')) archetypes = [];

          //   process.stdout.write('\x1Bc');
          //   console.log('Scraping WotC Events...');
          //   console.log(`${chalk.yellow(`Progress: ${_queueLength}/${(queue.length * dates.length)}`)} (${_progress} complete).`);
          //   console.log(`${timeRemaining} remaining.\n`);

          //   if (events && results && archetypes?.length) {
          //     console.info(chalk.yellowBright(`Event skipped: ${uri}`));
          //   }
          //   else {
          //     let { players, ...event } = data;
          //     dbQueue.push({ players, event });
          //     queueLength += players.length;
          //     goldfishQueue.push({ format: event.format, type: event.type, uid: event.uid });
          //     console.info(chalk.blueBright(`Added to queue: ${uri}`));
          //   }
          // }
        }
      })
    );

    // // Clear console
    // process.stdout.write('\x1Bc');
    // console.log('Scraping MTGGoldfish Events...');
    // // Setup Puppeteer
    // const { browser, page } = await usePuppeteerStealth();
    // // Update database entries syncronously
    // let progress = 0;
    // for (let i = 0; i < dbQueue?.length; i++) {
    //   const { players, event } = dbQueue[i];
    //   try {
    //     await updateDatabase(players, event, page,
    //       { i, progress, dbQueue, queueLength },
    //     );
    //   } catch (error) {
    //     const uri = `${event.format}-${event.type}-${event.date.replaceAll('/','-')}`
    //     console.log(`Error: ${uri} (${i + 1}/${dbQueue.length})`);
    //     console.error(chalk.red(error.stack));
    //     process.exit(1);
    //   }
    //   progress += players.length + 1;
    // }

    // // Cleanup
    // await page.close();
    // await browser.close();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red(error.stack));
    process.exit(1);
  }
};

if (runCron) {
  // Fetch as WotC posts events
  const job = new CronJob('* */30 10-15 * * *', run, null, null, 'America/Chicago');
  job.start();
} else {
  run();
}