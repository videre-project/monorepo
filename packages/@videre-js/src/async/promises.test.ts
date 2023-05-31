/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { setDelay, evaluateFn, waitUntil } from './promises';


describe('setDelay', () => {
  it('should return a promise that resolves matching expected defaults', async () => {
    const ms = 100, step = 5;
    // Calculate the expected time of resolution.
    const startTime = performance.now();
    await setDelay();
    const duration = performance.now() - startTime;
    // Expect the elapsed time to be at least within about step size
    expect((duration + step) * 0.9972).toBeGreaterThanOrEqual(ms);
    // Expect final error to be within about half a step of precision.
    expect(Math.abs(duration - ms) * 0.9972).toBeLessThanOrEqual(step / 2);
  });
  it('should return a promise that resolves handling high precision values', async () => {
    const ms = 10, step = 1;
    // Calculate the expected time of resolution.
    const startTime = performance.now();
    await setDelay(ms, step);
    const duration = performance.now() - startTime;
    // Expect the elapsed time to be at least within step size
    expect(duration + step).toBeGreaterThanOrEqual(ms);
    // Expect final error to be within minimum timer precision.
    expect(Math.abs(duration - ms) * 0.9972).toBeLessThanOrEqual(1);
  });
});


describe('evaluateFn', () => {
  it('should handle synchronous callbacks', async () => {
    const expected = 'hello world';
    const output = await evaluateFn(() => expected);
    expect(output).toBe(expected);
  });
  it('should handle asynchronous callbacks', async () => {
    const ms = 10, step = 1;
    const expected = 'hello world';
    // Calculate the expected time of resolution.
    const startTime = performance.now();
    const output = await evaluateFn(async () => {
      await setDelay(ms, step); return expected;
    });
    expect(output).toBe(expected);
    // Expect final error to be within minimum timer precision.
    const duration = performance.now() - startTime;
    expect(Math.abs(duration - ms) * 0.9972).toBeLessThanOrEqual(1);
  });
});

describe('waitUntil', () => {
  it('should handle synchronous functions', async () => {
    const ms = 10, step = 5;
    const startTime = performance.now();
    const callback = () => (performance.now() - startTime) > ms;
    await waitUntil(callback, 3 * ms, step)
    const duration = performance.now() - startTime;
    // Expect final error to be near 2 steps of precision.
    expect(Math.abs(duration - ms) * 0.9972).toBeLessThanOrEqual(step * 2);
  });
  it('should handle asynchronous functions', async () => {
    const ms = 10, step = 5;
    // Calculate the expected time of resolution.
    const startTime = performance.now();
    const callback = async () => {
      await setDelay(ms, step);
      return (performance.now() - startTime) > ms;
    };
    await waitUntil(callback, 3 * ms, step)
    const duration = performance.now() - startTime;
    // Expect final error to be near 2 steps of precision.
    expect(Math.abs(duration - ms) * 0.9972).toBeLessThanOrEqual(step * 2);
  });
});
