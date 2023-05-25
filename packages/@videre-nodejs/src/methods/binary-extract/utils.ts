/* @file
 * 
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { comma, obrace, cbrace, obracket, cbracket, mark } from './constants';


/**
 * Check if `buf[i-1] - buf[i+n]` equals `"chars"`.
 */
export function isMatch(buf: Buffer, i: number, chars: number[]): boolean {
  // Buffer must contain opening/closing quotation marks.
  if (buf[i - 1] != mark) return false;
  const len = chars.length;
  if (buf[i + len] != mark) return false;
  // Buffer must contain chars[] sequence of characters.
  for (let j = 0; j < len; j++) {
    if (buf[i + j] != chars[j]) return false;
  }
  // Return `true` only if all conditions are satisfied.
  return true;
};

/**
 * Find the end index of the object that starts at `start` in `buf`.
 */
export function findEnd(buf: Buffer, start: number): (number | undefined) {
  let level = 0;
  const s = buf[start], len = buf.length;
  for (let i = start; i < len; ++i) {
    const c = buf[i];
    // Increment or decrement level when crossing new arrays/objects.
    if (c == obrace || c == obracket) { ++level; continue; }
    else if (c == cbrace || c == cbracket) { if (--level > 0) continue; }
    // Return index when reaching end of an object or object array.
    if ((c == comma || c == cbrace || c == cbracket) && level <= 0) {
      return i + Number((s == obrace || s == obracket) && 1);
    };
  };
};
