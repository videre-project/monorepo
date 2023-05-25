/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { getKeys, pruneUndefinedKeys, removeDuplicateKeys, deepAssign } from './objects';


describe('getKeys', () => {
  it('ignores keys not present in an object', () => {
    const obj = { a: 1, ab: 2 };
    expect(getKeys(obj, 'a', 'b')).toEqual([1]);
    expect(getKeys(obj, 'a', 'b', 'ab')).toEqual([1, 2]);
  });
  it('preserves only last instance of key values', () => {
    // @ts-ignore - Expect (invalid) duplicate keys
    const obj = { a: 1, ab: 2, ab: 3 };
    expect(getKeys(obj, 'a', 'ab')).toEqual([1, 3]);
  });
});

describe('pruneUndefinedKeys', () => {
  const obj = { a: "1", b: 2.0, c: null, d: undefined };
  it('preserves null values by default', () => {
    const expected = { a: "1", b: 2.0, c: null };
    const output = pruneUndefinedKeys(obj, false);
    expect(output).toEqual(expected);
  });
  it('removes null values when `excludeNull` is true', () => {
    const expected = { a: "1", b: 2.0 };
    const output = pruneUndefinedKeys(obj, true);
    expect(output).toEqual(expected);
  });
});

describe('removeDuplicateKeys', () => {
  // @ts-ignore - Expect (invalid) duplicate keys
  const obj = { id: 1, id: [2, 3], uid: 4 };
  it('removes duplicate object keys', () => {
    const expected = { id: [2, 3], uid: 4 };
    const output = removeDuplicateKeys(obj);
    expect(output).toEqual(expected);
  });
  it('ignores subsequent array items if specified', () => {
    const expected = { id: 2, uid: 4 };
    const output = removeDuplicateKeys(obj, true);
    expect(output).toEqual(expected);
  });
});

describe('deepAssign', () => {
  it('merges two objects with matching keys', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };
    const expected = { a: 1, b: 3, c: 4 };
    const output = deepAssign(obj1, obj2);
    expect(output).toEqual(expected);
  });
  it('merges two objects with nested keys', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 } };
    const expected = { a: 1, b: { c: 2, d: 3 } };
    const output = deepAssign(obj1, obj2);
    expect(output).toEqual(expected);
  })
});
