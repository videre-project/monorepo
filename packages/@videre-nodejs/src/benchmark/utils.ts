/* @file
 * Helper methods for synchronous benchmarking.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { type stats } from './types';


/**
 * 
 * @param stats 
 * @returns 
 */
export function formatStats(stats: stats, decimals=2, locale='en-US') {
  const fmt = (num: number) => 
    (num).toLocaleString(locale, { maximumFractionDigits: decimals });
  return `${fmt(stats.mean)} ${stats.unit} ±${fmt(stats.std)} ${stats.unit}`;
};
