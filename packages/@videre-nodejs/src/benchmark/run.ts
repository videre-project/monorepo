/* @file
 * Runner methods for benchmarking.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { type stats } from './types';


/**
 * Measure average execution times with standard deviation.
 * @param fn Input function to benchmark.
 * @param iterations Number of iterations to benchmark.
 * @returns String representation of the result.
 */
export function test(fn: Function, iterations: number): stats {
  const times = new Array(iterations) as number[];
  for (let i = 0; i < iterations; ++i) {
    const time_1 = process.hrtime.bigint();
    fn();
    const time_2 = process.hrtime.bigint();
    times.push(Number(time_2 - time_1) / 1e6);
  };

  const n = times.length;
  const mean = times.reduce((a, b) => a + b) / n;
  const std = Math.sqrt(
    times
      .map(x => Math.pow(x - mean, 2))
      .reduce((a, b) => a + b) / n
  );

  return { mean, std, unit: 'ms' };
};
