import readline from 'readline';

import { setDelay } from '@videre/database';

import { CLEAR_CONSOLE } from './constants';

export const CLI_REMOVE_LINE = (times = 1) => {
  readline.moveCursor(process.stdout, 0, -(1 + times)) // up one line
  readline.clearLine(process.stdout, times) // from cursor to end
}

export const CLI_CLEAR_CONSOLE = () => process.stdout.write(CLEAR_CONSOLE);

export const CLI_PAUSE = async (
    prompt = 'Would you like to proceed?',
    options = '[Y/n]',
    resp_y = 'Proceeding...',
    resp_n = 'Exiting script...'
  ) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.input.on("keypress", function (c, k) {
    // get the number of characters entered so far:
    var len = rl.line.length;
    // move cursor back to the beginning of the input:
    readline.moveCursor(rl.output, -len, 0);
    // clear everything to the right of the cursor:
    readline.clearLine(rl.output, 1);
  });
  let _answer = null;
  await new Promise(resolve => {
    const override_prompt = ['-y', '--yes', '--assume-yes']
      .map(opt => process.argv.includes(opt) ? true : null)
      .filter(Boolean);
    if (override_prompt.length) console.log(`>> ${resp_y}`);
    else {
      rl.question(`>> ${prompt} ${options} `, {}, (answer) => {
        _answer = answer;
        if (resp_y !== null && resp_n !== null ) {
          CLI_REMOVE_LINE();
          console.log(`   ${prompt} ${options} ${answer}`);
        }
        if (['y', 'yy', 'yes'].includes(`${answer}`.toLowerCase())) {
          if (resp_y !== null && resp_n !== null ) {
            console.log(`>> ${resp_y}`);
          }
          _answer = 'yes';
        } else if (resp_y !== null && resp_n !== null ) {
          console.log(`>> ${resp_n}`);
          process.exit(0);
        }
        resolve();
      });
    }
  });
  if (resp_y !== null || resp_n !== null) await setDelay(1000);
  return _answer;
}