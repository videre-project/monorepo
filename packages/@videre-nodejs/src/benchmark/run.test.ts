/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { type stats } from './types';
import { test } from './run';


describe('test', () => {
  it('should return a consistent baseline average', () => {
    const iterations = 1000;
    function fn() { let j=0; for (let i = 0; j < 1e15; ++i) { j += 2**i }; };

    // Manually benchmark for sanity checking.
    const time_1 = process.hrtime.bigint();
    const output: stats = test(fn, iterations);
    const time_2 = process.hrtime.bigint();

    const mean = Number(time_2 - time_1) / (1e6 * iterations);
    expect(output.mean + output.std).toBeGreaterThan(0);
    expect(output.mean).toBeGreaterThanOrEqual(mean - 3*output.std);
    expect(output.mean).toBeLessThanOrEqual(mean);
  });
});
