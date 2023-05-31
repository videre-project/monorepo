/* @file
 * Formatting methods for arrays.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Returns a Map of the array grouped by the result of applying the input
 * grouping function to each element of the input array.
 * @param list An array of any type to group.
 * @param keyGetter Input grouping function.
 * @returns A map of arrays grouped by the result of applying the `keyGetter`.
 */
export function groupBy(list: any[], keyGetter: (s: any) => any) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) map.set(key, [item]);
    else collection.push(item);
  });
  return map;
};
