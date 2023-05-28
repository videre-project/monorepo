/* @file
 * Formatting methods for arrays.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Takes an Array and a grouping function, returning a Map of the array
 * grouped by the input grouping function.
 * @param list 
 * @param keyGetter 
 * @returns 
 */
export function groupBy(list: string[], keyGetter: (s: string) => string) {
  const map = new Map();
  for (let item in list) {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) map.set(key, [item]);
    else collection.push(item);
  };
  return map;
};
