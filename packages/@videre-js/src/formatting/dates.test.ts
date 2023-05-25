/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';

import { formatDate, formatTime } from './dates';


describe('formatDate', () => {
  it('formats a string date', () => {
    expect(formatDate('12/31/1969', 'en-US')).toBe("12/31/1969");
    expect(formatDate('1969/12/31', 'en-US')).toBe("12/31/1969");
  });
  it('formats a `Date` object', () => {
    expect(formatDate(new Date('12/31/1969'), 'en-US')).toBe("12/31/1969");
    expect(formatDate(new Date('1969/12/31'), 'en-US')).toBe("12/31/1969");
  });
});

describe('formatTime', () => {
  it('correctly handles decimal precision', () => {
    expect(formatTime(53.164 * 1e3)).toBe("53.2 seconds");
    expect(formatTime(531.64 * 1e3)).toBe("8 minutes and 52 seconds");
  });
  it('correctly formats units of time', () => {
    expect(formatTime(1e1)).toBe("0.01 seconds");
    expect(formatTime(1e2)).toBe("0.10 seconds");
    expect(formatTime(1e3)).toBe("1 second");
    expect(formatTime(60 * 1e3)).toBe("1 minute");
    expect(formatTime(60**2 * 1e3)).toBe("1 hour");
    expect(formatTime(24 * 60**2 * 1e3)).toBe("1 day");
  });
  it('correctly formats multiple units of time', () => {
    expect(formatTime(1e3 + 60 * 1e3)).toBe("1 minute and 1 second");
    expect(formatTime(1e3 + 60**2 * 1e3)).toBe("1 hour and 1 second");
  });
});
