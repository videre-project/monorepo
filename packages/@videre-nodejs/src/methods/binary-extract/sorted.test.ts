/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import extract_key from './sorted';


describe('extract_key', () => {
  it('extracts a key from a buffer of stringified JSON', () => {
    const json = { a: 1, b: 2, c: 3, d: 4 };
    const buffer = Buffer.from(JSON.stringify(json));
    const output = extract_key(buffer, ['b']);
    expect(output).toEqual(json['b']);
  });
});
