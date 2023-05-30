/* @file
 * 
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { char, comma, obrace, cbrace, colon, mark, backslash } from './constants';
import { isMatch, findEnd } from './utils';


/**
 * 
 * @param buf 
 * @param keys 
 * @param indexed 
 * @param asdict 
 * @returns 
 */
export default function extract_key(buf: Buffer, keys: string[] | string,
                                    indexed=false, asdict=false) {
  // Sort keys alphabetically
  if (Array.isArray(keys)) { keys = keys.sort() } else keys = [keys];

  // Converts keys to an array of char codes.
  const chars = keys.map(key => key.split('').map(char)); // es2021 - [...key]

  // This is intended to be used as part of flatstorage optimizations on
  // immutable filesystems, and is included in this method for convenience.
  const key_idx: any = {};
  if (indexed) {
    // Use __sortIndex__ attr to skip unnecessary buffer scans in sorted arrays.
    const sortIndex = extract_key(buf, '__sortIndex__', false);
    // Create key index for jumping across buffer regions in memory
    keys.forEach((_,j) => { key_idx[j] = sortIndex[''+chars[j][0]][0]; });
  };
  
  // index of key search
  let j = 0;
  // level bitmap proxy
  let isKey = true;
  let inString = false;
  let level = 0;
  // search values
  const values: any[] = [];
  for (let i = key_idx[0] ?? 0; i < buf.length; ++i) {
    const c = buf[i];
    
    // Skip to next character if current character escapes/delimits a string.
    if (c === backslash) { ++i; continue; }
    else if (c === mark) { inString = !inString; continue; }
    // Check if previous characters delimit a key or a new tree level.
    else if (!inString) {
      if (c === colon) isKey = false;
      else if (c === comma) isKey = true;
      else if (c === obrace) ++level;
      else if (c === cbrace) --level;
    };

    // Skip until the next key or tree level
    if (!isKey || level > 1) continue;
    // Search for matches for each key
    else if (!isMatch(buf, i, chars[j])) continue;

    // Extract value within matched index range.
    const a = i + keys[j].length + 2;
    const b = findEnd(buf, a);
    // @ts-ignore - Typescript cannot properly map NodeJS buffer methods.
    values[asdict && keys[j] || j] = JSON.parse(buf.subarray(a,b));

    // End search when all values are found; otherwise iterate to next key.
    if (j+1 === keys.length) break; else ++j;

    // Apply sortIndex optimization to avoid oversearching.
    if (indexed && keys[j-1][0] !== keys[j][0]) i = key_idx[j];
  };

  return keys.length > 1 ? values : values[0];
};
