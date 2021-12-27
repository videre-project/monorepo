import { CONSTANTS } from '@packages/database';

/**
 * Converts an expression of days to milliseconds.
 * @param {Number} days Integer expressed in days.
 * @returns {Number} Integer expressed in milliseconds.
 * @example conertDaystoMS(3) -> 259200000 (2.592E+08 milliseconds)
 */
const convertDaystoMS = (days) => (days ? parseInt(days) : 0) * CONSTANTS.day;

/**
 * Validates whether a stringified date is valid.
 * @param {String} date Date to be tested.
 * @returns {Boolean} Boolean of whether date is valid.
 * @example validateDate('12/31/1969') -> True
 */
export const validateDate = (date) => {
  return !isNaN(Date.parse(date))
    && date?.split(/(?:\/|-)+/)?.length == 3;
}

/**
 * Formats date based on Intl standard.
 * @param {(String|Date)} date  Date to be formatted.
 * @param {String} standard     Intl standard for date format.
 * @returns {String} Formatted date.
 * @example formatDate('1969/12/31', 'en-US') -> "12/31/1969"
 */
export const formatDate = (date, standard = 'en-US') => {
  return new Intl.DateTimeFormat(standard).format(date);
}

/**
 * Format prettified dates from query string.
 * @param {(String|Date)} min_date Minumum date for date range.
 * @param {(String|Date)} max_date Maximum date for date range.
 * @param {Number} offset          Numerical offset in days to shift date range
 *                                  by.
 * @param {Number} time_interval   Time interval in days to constrain the date
 *                                  range. Used as a contraint if both or either
 *                                  minimum / maximum dates are not specified.
 * @returns {{ min_date: String, max_date: String }}
 * An object with a 'min_date' and 'max_date' key.
 * @example
 * parseDateRange('12/31/1969', null, 0, 14) -> { min_date: 12/31/1969, max_date: 1/14/1970 }
 */
export const parseDateRange = (min_date, max_date, offset, time_interval) => {
  const _offset = convertDaystoMS(offset);
  const _time_interval = convertDaystoMS(time_interval);

  const _min_date = validateDate(min_date)
    ? formatDate(new Date(min_date).getTime() + _offset)
    : undefined;

  const _max_date = validateDate(max_date)
    ? formatDate(new Date(max_date).getTime() - _offset)
    : formatDate(new Date().getTime() - _offset);

  return {
    min_date: !validateDate(min_date)
    || !(validateDate(min_date) && validateDate(max_date))
      ? formatDate(new Date(_max_date).getTime() - _time_interval)
      : _min_date,
    max_date: !validateDate(max_date)
    || !(validateDate(min_date) && validateDate(max_date))
      ? formatDate(new Date().getTime(_min_date) + _time_interval)
      : _max_date
  };
}

export default parseDateRange;