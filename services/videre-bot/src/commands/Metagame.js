import chalk from 'chalk';
import fetch from 'node-fetch';

import config from 'config';
import { ERROR_DEFAULTS, ERROR_MESSAGE } from 'constants';

import { toPascalCase } from '@packages/database';
import { MTGO } from '@packages/magic';

import { formatMonospaceTable } from 'utils/discord/table';
import { formatListAsPages, createPagesInteractive } from 'utils/discord/interactive';

const Metagame = {
  name: 'metagame',
  description: "(WIP) Displays a metagame breakdown of decks from the most recent events by format.",
  type: 'global',
  options: [
    {
      name: 'format',
      description: 'A specific format to return metagame data from. (Required)',
      type: 'string',
      required: true,
      choices: MTGO.FORMATS.map(format => ({
        name: toPascalCase(format),
        value: format
      })),
    },
    {
      name: 'time_interval',
      description: 'Amount of days to fetch results from. (Default 14)',
      type: 'integer',
    },
    {
      name: 'offset',
      description: 'Offset in days to shift results\' time range.',
      type: 'integer',
    },
    {
      name: 'min_date',
      description: 'Minimum date to return results from in `MM/DD/YYYY` or `YYYY/MM/DD` format.',
      type: 'string',
    },
    {
      name: 'max_date',
      description: 'Maximum date to return results from in `MM/DD/YYYY` or `YYYY/MM/DD` format.',
      type: 'string',
    },
  ],
  async execute({ args }) {
    try {
      // Format args as url parameters for API
      const params = Object.keys(args)
      .map((arg, i) =>
        typeof(arg) == 'object'
          ? arg.map(_arg => Object.keys(args)[i] + '=' + args[_arg])
          : Object.keys(args)[i] + '=' + args[arg]
      ).join('&');

      const response = await fetch(config.api + 'metagame?' + params)
        .then(res => res.json());
      if (!response?.parameters) {
        return {
          ...ERROR_DEFAULTS,
          description: response.details + '\n' +
            response?.warnings
              ? '```\n' + response.warnings.join('\n') + '\n```'
              : ''
        };
      }

      const { format, time_interval, offset } = response.parameters;
      const date_range = response
        .data[format.toLowerCase()]
        .events.data.map(obj => obj.date)
        .sort((a, b) => (new Date(a) > new Date (b) ? 1 : -1));

      const data = response
        .data[format.toLowerCase()]
        .archetypes.data.map(obj => ({
          'Meta %': obj.percentage,
          'Qty': obj.count,
          'Archetype': obj.displayName,
        }));
          
      const pages = formatListAsPages(
        formatMonospaceTable(data, 16, true)
          .map(page => ({
            name: [
              'Top archetypes in',
              format.charAt(0).toUpperCase() + format.slice(1),
              Object.keys(response.parameters).length > 2
                ? 'within a span of'
                : 'in the last',
              time_interval, (time_interval == 1 ? 'day' : 'days')
            ].join(' ') + ':\n'
            + (date_range?.length
              ? '\`(' + date_range[0] + ' to ' + date_range.slice(-1)[0]
                + (offset
                  ? `; offset by ${ offset } ${ offset == 1 ? 'day' : 'days' }`
                  : '')
                + ')\`'
              : ''),
            value: `\`\`\`diff\n${ page?.join('\n') }\n\`\`\``,
          })),
        { title: 'Metagame' }, 1, 'fields',
      );

      return await createPagesInteractive(pages);
    } catch (error) {
      console.error(
        chalk.white(
          `${chalk.blue('[/Metagame]')} args: [ ${[
            `${chalk.grey('format:')} ${!args?.format ? 'None' : chalk.green(`"${args?.format}"`)}`,
            `${chalk.grey('time_interval:')} ${!args?.time_interval ? 'None' : chalk.yellow(args?.time_interval)}`,
          ].join(', ')} ]\n>> ${chalk.red(error.stack)}`
        )
      );
      return ERROR_MESSAGE('An error occured while fetching metagame data.', error, interaction);
    }
  },
};

export default Metagame;