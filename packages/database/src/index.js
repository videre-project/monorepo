import postgres from 'postgres';

import config from './config';

export * as CONSTANTS from './constants';
export * as STATISTICS from './statistics';

export * from './functions';
export * from './sort';
export * from './swiss';
export * from './tools';

/**
 * Queries database, accepts a template string or JSON to format.
 *
 * @example sql`SELECT * FROM users`
 * @example sql`INSERT INTO users ${sql(user)}`
 */
export const sql = postgres(
  config.connectionString || 'postgresql://postgres:videre@127.0.0.1:5432/postgres',
  {
    max: 1,
    idle_timeout: 3,
    connect_timeout: 5,
  }
);

export const setDelay = ms => new Promise(res => setTimeout(res, ms));

export const parseTime = (totalSeconds) => {
  let days = Math.floor(totalSeconds / 86400).toFixed(0);
  let hours = Math.floor(totalSeconds / 3600).toFixed(0);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60).toFixed(0);
  let seconds = (totalSeconds % 60).toFixed(0);
  // Create array of these values to later filter out null values
  let formattedArray = totalSeconds.toFixed(0) == 0 ? ['', '', '', '0 seconds'] : [
      days > 0 ? `${ days } ${ (days == 1 ? 'day' : 'days') }` : ``,
      hours > 0 ? `${ hours } ${ (hours == 1 ? 'hour' : 'hours') }` : ``,
      minutes > 0 ? `${ minutes } ${ (minutes == 1 ? 'minute' : 'minutes') }` : ``,
      seconds > 0 ? `${ seconds } ${ (seconds == 1 ? 'second' : 'seconds') }` : ``,
  ];
  return formattedArray
      .filter(Boolean)
      .join(', ')
      // Replace last comma with ' and' for fluency
      .replace(/, ([^,]*)$/, ' and $1');
}

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Converts an integer to an ordinal.
 */
 export const getNumberWithOrdinal = n => {
  let s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Removes undefined object keys.
 */
export const pruneObjectKeys = object => {
  return Object.entries(object)
    .filter(([, v]) =>
      typeof v == 'object'
        ? (v != null && JSON.stringify(v)!='{}' && JSON.stringify(v)!='[]')
        : v != undefined
    ).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};