/**
 * Converts a vanilla or camelCase string to SNAKE_CASE.
 */
export const snakeCase = string =>
  string
    .replace(/[A-Z]/g, char => `_${char}`)
    .replace(/\s+|_+/g, '_')
    .toUpperCase();

/**
 * Converts a vanilla string to pascalCase.
 */
export const toPascalCase = text => text.charAt(0).toUpperCase() + text.slice(1);

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