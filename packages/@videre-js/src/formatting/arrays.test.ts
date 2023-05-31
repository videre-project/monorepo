/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { groupBy } from './arrays';


describe('groupBy', () => {
  it('should group a list by a callback', () => {
    const list = [0, 1, 2, 3, 4, 5];
    const grouped = groupBy(list, (x) => x % 2);
    expect(Object.fromEntries(grouped)).toEqual({
      0: [0, 2, 4],
      1: [1, 3, 5],
    });
  });
  it('should group an object array by a callback', () => {
    const objArr = [{ x: 0 }, { x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }];
    const grouped = groupBy(objArr, (obj) => obj.x % 2);
    expect(Object.fromEntries(grouped)).toEqual({
      0: [{ x: 0 }, { x: 2 }, { x: 4 }],
      1: [{ x: 1 }, { x: 3 }, { x: 5 }],
    });
  });
});
