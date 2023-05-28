/* @file
 * 
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { readFileSync } from 'fs';

import { uncompressSync } from 'lz4-napi';

import { types, test, formatStats } from '../../../benchmark';


/**
 * Runs decompression benchmark for average decompression time.
 * @param filepath 
 * @param iterations Number of iterations to run.
 * @returns Average time in milliseconds with standard deviation.
 */
export function decompress_benchmark(filepath: string, iterations=100) {
  const raw = readFileSync(filepath);

  // Sample decompression times
  const fn = () => uncompressSync(raw);
  const runs: types.stats = test(fn, iterations);

  return formatStats(runs);
};
