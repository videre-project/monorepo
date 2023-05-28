/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { char } from './constants';
import { isMatch, findEnd } from './utils';


describe('isMatch', () => {
  const buffer = Buffer.from('"keyA": 1, "keyB": "2", "keyC');
  it('correctly matches an object key', () => {
    const output1 = isMatch(buffer, 1, 'keyA'.split('').map(char));
    expect(output1).toBe(true);
    const output2 = isMatch(buffer, 12, 'keyB'.split('').map(char));
    expect(output2).toBe(true);
  });
  it('does not match an incomplete object key', () => {
    const output = isMatch(buffer, 1, 'keyC'.split('').map(char));
    expect(output).toBe(false);
  });
});

describe('findEnd', () => {
  it('finds the end of a stringified JSON object', () => {
    const buffer = Buffer.from('{"keyB": "2", "keyC"}');
    const output = findEnd(buffer, 0);
    expect(output).toBe(buffer.length);
  });
  it('finds the end of a right-truncated JSON object', () => {
    const a = '"keyA": 1, '; const b = '{"keyB": "2", "keyC"}';
    const buffer = Buffer.from(a + b);
    const output = findEnd(buffer, a.length);
    expect(output).toBe(a.length + b.length);
  });
  it('finds the end of a left-truncated JSON object', () => {
    const a = '{"keyB": "2", "keyC"}'; const b = ', "keyA": 1'; 
    const buffer = Buffer.from(a + b);
    const output = findEnd(buffer, a.length);
    expect(output).toBe(a.length);
  });
});
