/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { existsSync } from 'fs';

import { waitUntil } from '@videre/js';

import { describe, test, it, expect } from '@jest/globals';

import { filepath } from './__mock__';
import { decompress_benchmark } from './benchmark';


/**
 * Reconstruct `stats` object from output string.
 */
function formatStats(str: string) {
  const times = str.split(/\s[±]|\s/g);
  return { mean: Number(times[0]), std: Number(times[2]), unit: 'ms' };
};

describe('decompress_benchmark', () => {
  test('depends on `writeCollection` test', async () =>
    await waitUntil(() => existsSync(filepath + '0.catalog.json')), 10 * 1e3);
  it('should return a consistent baseline average', () => {
    const collection = filepath + '0.collection.lz4';
    const iterations = 5 * 1e4;

    // Manually benchmark for sanity checking.
    const time_1 = process.hrtime.bigint();
    const output = decompress_benchmark(collection, iterations);
    const time_2 = process.hrtime.bigint();
    expect(output === "0 ms ±0 ms").toBe(false);

    const stats = formatStats(output);
    const mean = Number(time_2 - time_1) / (1e6 * iterations);
    expect(stats.mean + stats.std).toBeGreaterThan(0);
    expect(stats.mean).toBeGreaterThanOrEqual(mean - 3*stats.std);
    expect(stats.mean).toBeLessThanOrEqual(mean);
  });
});
