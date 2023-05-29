/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { getArgs } from './argv';


describe('getArgs', () => {
  it('returns the first match', () => {
    const flags = ['--foo a', 'bar', '--baz', '--foo b', 'qux'];
    expect(getArgs(flags, ['--foo a'])).toBe('bar');
  });
});
