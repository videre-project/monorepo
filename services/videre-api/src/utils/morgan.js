import morgan from 'morgan';
import chalk from 'chalk';
import { getNumberWithOrdinal } from '@videre/database';
import { API_DIR, parseRoute, crawlRoutes } from './routes';

const colors = {
  METHOD: {
    GET: '#61affe',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    POST: '#49cc90',
  },
  STATUS: {
    500: '#ffa200',
    400: '#ff5c5c',
    300: '#5271ff',
    200: '#35b729',
  },
};

export const morganMiddleware = morgan((tokens, req, res) => {
  const [dd, m, yyyy, time, tz] = tokens.date(req, res).slice(5).split(' ');
  const date = [
    m,
    getNumberWithOrdinal(dd),
    yyyy,
    '@',
    time
      .split(':')
      .map(x => ('00' + x).slice(-2))
      .join(':'),
    tz,
  ].join(' ');

  const method = tokens.method(req, res);
  const methodColor = colors.METHOD?.[method] || '#ffffff';
  const apiMethod = tokens.url(req, res)?.split('?')[0];

  const status = tokens.status(req, res);
  const statusColor = colors.STATUS?.[status.slice(0, 1) + '00'] || '#ffffff';

  const responseTime = tokens['response-time'](req, res);
  const resonseTimeColor =
    responseTime <= 500
      ? '#00FF00' // Green
      : responseTime <= 1000
      ? '#FFFF00' // Yellow
      : responseTime <= 3000
      ? '#FFA500' // Orange
      : responseTime <= 5000
      ? '#FF0000' // Red
      : '#800080'; // Purple

  const methodPadding = Math.max(
    ...crawlRoutes(API_DIR).map(route => parseRoute(route.slice(API_DIR.length)).length)
  );

  return chalk.hex('#000000')(
    chalk.yellow('[Logs] ') +
      [
        chalk.hex('#7E7E89')(date),
        chalk.bgHex(statusColor)(chalk.bold(` ${status} `)),
        chalk.bgHex(methodColor)(chalk.bold(` ${method} `)) +
          ' ' +
          chalk.hex(methodColor)(
            [apiMethod, new Array(1 + methodPadding).fill(',')]
              .join('')
              .replaceAll(',', ' ')
              .slice(0, methodPadding)
          ),
        chalk.hex('#7E7E89')('Took ' + chalk.hex(resonseTimeColor)(responseTime) + ' ms'),
      ].join(chalk.hex('#7E7E89')(chalk.bold(' | ')))
  );
});
