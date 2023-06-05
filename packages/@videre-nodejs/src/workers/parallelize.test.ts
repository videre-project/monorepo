/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

// import { parallelize } from './parallelize';
import { parallelize } from '../../build/workers/parallelize.js';


describe('parallelize', () => {
  it('runs the given callback in parallel', async () => {
    const callback = (i: number) => (i + 1).toString();
    const args = [0, 1, 2, 3, 4];
    const output = await parallelize(callback, args);
    const expected = ['1', '2', '3', '4', '5'];
    expect(output).toEqual(expected);
  });
  it('handles asynchronous callbacks in parallel', async () => {
    const callback = async (i: number) => {
      await require('@videre/js').setDelay(100);
      return (i + 1).toString();
    };
    const args = [0, 1, 2, 3, 4];
    const output = await parallelize(callback, args);
    const expected = ['1', '2', '3', '4', '5'];
    expect(output).toEqual(expected);
  });
  it('handles callbacks that don\'t always return values', async () => {
    // @ts-ignore - Does not return a value for i = 0.
    const callback = (i: number) => { if (i) return (i + 1).toString(); }
    const args = [0, 1, 2, 3, 4];
    const output = await parallelize(callback, args);
    const expected = [undefined, '2', '3', '4', '5'];
    expect(output).toEqual(expected);
  });
});
