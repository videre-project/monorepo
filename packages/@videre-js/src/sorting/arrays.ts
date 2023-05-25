/* @file
 * Sorting methods for arrays.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/*
 * Name of a property to be sorted in ascending order.
 */
type sortArg<T> = keyof T | `-${string & keyof T}`;

/**
 * Returns a comparator for objects of type T that can be used by sort
 * functions, were T objects are compared by the specified T properties.
 *
 * @param sortBy - The names of the properties to sort by, in precedence order.
 *                 Sorted in reverse order when prefixing properties with `-`.
 */
export function dynamicSort<T extends object> (sortBy: sortArg<T>[]) {
  function compareProps(arg: sortArg<T>) {
    let key = arg as keyof T, sortOrder = 1;
    // Invert sorting order when key starts with '-'
    if (typeof arg === 'string' && arg.startsWith('-')) {
      sortOrder = -1; key = arg.slice(1) as keyof T;
    }
    return (a: T, b: T) =>
      sortOrder * (a[key] < b[key] ? -1 : Number(a[key] > b[key]));
  }

  return (a: T, b: T) => {
    let result = 0;
    const len = sortBy?.length
    for (let i = 0; i < len; ++i) {
      if (result === 0) result = compareProps(sortBy[i])(a, b); else break;
    }
    return result
  };
};

/**
 * Sorts an array of T by the specified properties of T.
 *
 * @param arr - the array to be sorted, all of the same type T
 * @param sortBy - the names of the properties to sort by, in precedence order.
 *                 Prefix any name with `-` to sort it in descending order.
 */
export function sort<T extends object> (arr: T[], ...sortBy: sortArg<T>[]) {
  return arr.sort(dynamicSort<T>(sortBy));
};
