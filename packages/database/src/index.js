export * as CONSTANTS from './constants';

export * from './prisma';
export * from './postgres';
export * from './utils';

/**
 * Creates a promise that resolves after a specified amount of milliseconds.
 */
export const setDelay = ms => {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * Converts an integer to an ordinal.
 */
export const getNumberWithOrdinal = num => {
  let seq = ['th', 'st', 'nd', 'rd'],
    val = num % 100;
  return num + (seq[(val - 20) % 10] || seq[val] || seq[0]);
};

/**
 * Removes undefined object keys.
 */
export const pruneObjectKeys = object => {
  return Object.entries(object)
    .filter(([, v]) =>
      typeof v == 'object'
        ? (v != null && JSON.stringify(v) != '{}' && JSON.stringify(v) != '[]')
        : v != undefined
    ).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};