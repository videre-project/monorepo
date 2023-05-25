/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { type stats } from './types';
import { formatStats } from './utils';


describe('formatStats', () => {
  it('formats a `stats` object', () => {
    const obj: stats = {
      mean: 3.14159265358979,
      std: 6.283185307179586,
      unit: 'ms'
    };
    expect(formatStats(obj)).toBe('3.14 ms ±6.28 ms');
  });
});
