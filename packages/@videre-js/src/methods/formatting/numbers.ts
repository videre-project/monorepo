/* @file
 * Formatting methods for numerics.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Converts an integer to an ordinal.
 * @param num Input integer.
 * @returns Stringified ordinal number.
 * @example getNumberWithOrdinal(21) -> '21st'
 */
export function getNumberWithOrdinal(num: number) {
  const seq = ['th', 'st', 'nd', 'rd'], val = num % 100;
  return num + (seq[(val - 20) % 10] || seq[val] || seq[0]);
};

/**
 * Converts an integer to a number of bytes in the appropriate unit.
 * @param bytes Input raw number of bytes.
 * @param digits Number of digits of precision in closest unit.
 * @param asBinary Whether to return the value as a binary representation.
 * @returns String unit representation rounded to `digits` of precision.
 */
export function formatBytes(bytes: number, digits=2, asBinary=true) {
  if (!bytes) return '0 B';

  const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  if (asBinary) {
    unitIndex = Math.min(
      Math.floor(Math.log10(bytes)/(10 * Math.log10(2))),
      UNITS.length - 1
    );
    bytes /= 2 ** (10 * unitIndex);
  } else {
    unitIndex = Math.min(
      Math.floor(Math.log10(bytes) / 3),
      UNITS.length - 1
    );
    bytes /= 1e3 ** unitIndex;
  };
  
  // @ts-ignore - new Intl.NumberFormat() can accept string values.
  const size = new Intl.NumberFormat().format(bytes.toFixed(digits));
  const unit = UNITS[unitIndex];

  return `${size} ${unit}`;
};
