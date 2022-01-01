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