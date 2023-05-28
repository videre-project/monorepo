/* @file
 * Formatting methods for Datetime and timestamp types.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Formats date based on Intl standard.
 * @param date Date to be formatted.
 * @param standard Intl standard for date format.
 * @returns Formatted date.
 * @example formatDate('1969/12/31', 'en-US') -> "12/31/1969"
 * @example formatDate(new Date('1969/12/31'), 'en-US') -> "12/31/1969"
 */
export const formatDate = (date: string | Date, standard: string='en-US') => {
  const _date = typeof date == 'object' ? date : new Date(date);
  return new Intl.DateTimeFormat(standard).format(_date);
};

/**
 * 
 * @param ms 
 * @returns 
 */
export function formatTime(ms: number) {
  let totalSeconds = ms/1000;

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 84600) / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Number((totalSeconds % 60).toFixed(minutes > 0 ? 0 : 1));
  // Create array of these values to later filter out null values
  const formattedArray = [
    days > 0 && `${ days } ${ (days == 1 ? 'day' : 'days') }`,
    hours > 0 && `${ hours } ${ (hours == 1 ? 'hour' : 'hours') }`,
    minutes > 0 && `${ minutes } ${ (minutes == 1 ? 'minute' : 'minutes') }`,
    seconds >= 1 && `${ seconds } ${ (seconds == 1 ? 'second' : 'seconds') }`,
    // If below 1 second, use 2 decimals of precision for fractional amounts.
    ms < 1000 && `${ (ms/1000).toFixed(2) } ${ (ms/1000 == 1 ? 'second' : 'seconds') }`
  ];

  return formattedArray
    .filter(Boolean)
    .join(', ')
    // Replace last comma with ' and' for fluency
    .replace(/, ([^,]*)$/, ' and $1');
};
