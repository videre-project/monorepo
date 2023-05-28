/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { is_expired } from './dates';


describe('is_expired', () => {
  const a = new Date('12/31/1969');
  const b = new Date('01/01/1970');
  it('compares two dates using a smaller interval', () => {
    const min_interval = 0.5 * 86400 * 1e3;
    expect(is_expired(a, b, min_interval)).toBe(true);
  });
  it('compares two dates using an exact interval', () => {
    const min_interval = 86400 * 1e3;
    expect(is_expired(a, b, min_interval)).toBe(true);
  });
  it('compares two dates using a larger interval', () => {
    const min_interval = 1.5 * 86400 * 1e3;
    expect(is_expired(a, b, min_interval)).toBe(false);
  });
});
