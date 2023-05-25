/* @file
 * 
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { readFileSync } from 'fs';

import { uncompressSync } from 'lz4-napi';


/**
 * Runs decompression benchmark for average decompression time.
 * @param filepath 
 * @param iterations Number of iterations to run.
 * @returns Average time in milliseconds with standard deviation.
 */
export function decompress_benchmark(filepath: string, iterations=100) {
  const raw = readFileSync(filepath);

  // Sample decompression times
  const times = [] as number[];
  for (let i = 0; i < iterations; ++i) {
    const time_1 = Date.now();
    uncompressSync(raw);
    times.push(Date.now() - time_1);
  };

  const n = times.length;
  const mean = times.reduce((a, b) => a + b) / n;
  const std = Math.sqrt(
    times
      .map(x => Math.pow(x - mean, 2))
      .reduce((a, b) => a + b) / n
  );

  return `${mean.toFixed(2)} ms ±${std.toFixed(3)} ms`;
};
