import chalk from 'chalk';
import Bot from 'bot';

import { CLI_CLEAR_CONSOLE } from '@videre/cli';

CLI_CLEAR_CONSOLE();
const bot = new Bot();
console.info(`${chalk.cyanBright('[Bot]')} Starting bot...`);
bot.start();
