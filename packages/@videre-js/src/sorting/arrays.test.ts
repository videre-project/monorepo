/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { dynamicSort, sort } from './arrays';


describe('dynamicSort', () => {
  const arr = [{ id: 2 }, { id: 1 }, { id: 3 }];
  it('sorts an array of objects in ascending order', () => {
    const output = arr.sort(dynamicSort(['id']));
    const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(output).toEqual(expected);
  });
  it('sorts an array of objects in descending order', () => {
    const output = arr.sort(dynamicSort(['-id']));
    const expected = [{ id: 3 }, { id: 2 }, { id: 1 }];
    expect(output).toEqual(expected);
  });
});

describe('sort', () => {
  const arr = [{ id: 2 }, { id: 1 }, { id: 3 }];
  it('sorts an array of objects in ascending order', () => {
    const output = sort(arr, 'id');
    const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(output).toEqual(expected);
  });
  it('sorts an array of objects in descending order', () => {
    const output = sort(arr, '-id');
    const expected = [{ id: 3 }, { id: 2 }, { id: 1 }];
    expect(output).toEqual(expected);
  });
});
