/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { getNumberWithOrdinal, formatBytes } from './numbers';


describe('getNumberWithOrdinal', () => {
  it('should return the ordinal number', () => {
    expect(getNumberWithOrdinal(0)).toBe('0th');
    expect(getNumberWithOrdinal(1)).toBe('1st');
    expect(getNumberWithOrdinal(2)).toBe('2nd');
    expect(getNumberWithOrdinal(3)).toBe('3rd');
    expect(getNumberWithOrdinal(4)).toBe('4th');
    // Next 10
    expect(getNumberWithOrdinal(10)).toBe('10th');
    expect(getNumberWithOrdinal(11)).toBe('11th');
    expect(getNumberWithOrdinal(12)).toBe('12th');
    expect(getNumberWithOrdinal(13)).toBe('13th');
    expect(getNumberWithOrdinal(14)).toBe('14th');
    // Next 10
    expect(getNumberWithOrdinal(20)).toBe('20th');
    expect(getNumberWithOrdinal(21)).toBe('21st');
    expect(getNumberWithOrdinal(22)).toBe('22nd');
    expect(getNumberWithOrdinal(23)).toBe('23rd');
    expect(getNumberWithOrdinal(24)).toBe('24th');
  });
});

describe('formatBytes', () => {
  it('should format in binary by default', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(1)).toBe('1 B');
      expect(formatBytes(1000)).toBe('1,000 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 ** 2)).toBe('1 MB');
      expect(formatBytes(1024 ** 3)).toBe('1 GB');
      expect(formatBytes(1024 ** 4)).toBe('1 TB');
  });
  it('should allow for international standard', () => {
    const _formatBytes = (num: number) => formatBytes(num, 2, false);
    expect(_formatBytes(0)).toBe('0 B');
    expect(_formatBytes(1)).toBe('1 B');
    expect(_formatBytes(1000)).toBe('1 KB');
    expect(_formatBytes(1024)).toBe('1.02 KB');
    expect(_formatBytes(1000 ** 2)).toBe('1 MB');
    expect(_formatBytes(1000 ** 3)).toBe('1 GB');
    expect(_formatBytes(1000 ** 4)).toBe('1 TB');
});
});
