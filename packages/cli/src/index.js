export * as CONSTANTS from './constants';
export * from './formatting';
export * from './functions';

/**
 * Parse argv flags by arg name/aliases
 */
 export const getArgs = (args, flags, offset = 1) => {
  return flags.map(opt => {
    if (process.argv.includes(opt)) return args[args.indexOf(opt)+offset];
  })?.[0];
}