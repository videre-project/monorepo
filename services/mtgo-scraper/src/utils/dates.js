import { getArgs } from '@videre/cli';
import { CONSTANTS } from '@videre/database';

// Check if Daylight Savings is in effect.
const isDST = (date) => {
  let jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  let jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) != date.getTimezoneOffset(); 
}

/**
 * Create date range
 */
export const getDates = (args) => {
    // Convert UTC time to MST time.
    const offset = (6 * (CONSTANTS.day / 24))
      + (CONSTANTS.day * (getArgs(args, ['-o', '--offset']) || 1))
      // Correct for Daylight Savings.
      + ((isDST(new Date()) ? 0 : 1) * (CONSTANTS.day / 24));

    const startDate = getArgs(args, ['--min', '--min_date'])
      || new Date(new Date().valueOf() - offset);
    const endDate = getArgs(args, ['--max', '--max_date'])
      || new Date();

    const duration = new Date(endDate) - new Date(startDate);
    const steps = Math.round(duration / CONSTANTS.day);

    return Array.from(
      { length: steps + 1 },
      (_, i) => new Date(new Date(startDate).valueOf() + CONSTANTS.day * i)
    );
  };