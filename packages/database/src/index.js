export * as CONSTANTS from './constants';
export * from './formatting';

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