import { CronJob } from 'cron';
import run from './scraper';

let args = process.argv.slice(2);
const runCron = process.argv[2] === 'cron';

if (runCron) {
  args = args.splice(args.indexOf('cron') - 2, 1);
  // Fetch as WotC posts events
  const job = new CronJob('* */30 10-15 * * *', run(args), null, null, 'America/Chicago');
  job.start();
} else {
  run(args);
}