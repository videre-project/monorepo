/* @file
 * Sorting methods for Datetime / timestamp types.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Checks for expiry between any two date values.
 */
export function is_expired(a: Date, b: Date, min_interval: number=0) {
  // Format date as timestamp integer
  const time = (date: Date) => (date ? new Date(date) : new Date()).getTime();
  
  return (
    // Must have a defined, sequential relationship between a and b.
    (time(b) > time(a)) && (time(b) - time(a)) > 0
    // Difference must equal or exceed that of it's collection interval.
    && min_interval <= (time(b) - time(a))
  );
};
