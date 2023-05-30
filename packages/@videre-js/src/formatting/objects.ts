/* @file
 * Formatting methods for objects.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Get object keys by last instance of name or alias.
 * @param object Input object. 
 * @param props List of key names.
 * @returns List of key values.
 * @example getKeys({ a: 1, b: 2 }, 'a', 'b', 'c') -> [1, 2]
 * @example getKeys({ a: 1, a: 2, b: 3 }, 'a', 'b') -> [2, 3]
 * @example getKeys({ a: 1, b: 2, a: 3 }, 'a', 'b') -> [3, 2]
 */
export function getKeys(object: object, ...props: string[]): string[] {
  return []
    .concat
    .apply([],
      props
        ?.map(prop => object?.[prop as keyof typeof object])
        .filter(Boolean)
    );
};

/**
 * Removes undefined object keys.
 * @param object Input object.
 * @param excludeNull Flag to skip pruning of null values.
 * @returns Pruned object.
 * @example pruneUndefinedKeys({ a: "1", b: 2.0, c: null, d: undefined }) -> { a: "1", b: 2.0, c: null }
 */
export function pruneUndefinedKeys(object: object, excludeNull=false): object {
  return Object.entries(object)
    .filter(([, v]) =>
      typeof v == 'object'
        ? ((v != null || !excludeNull)
            && JSON.stringify(v) != '{}'
            && JSON.stringify(v) != '[]')
        : v != undefined
    ).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};

/**
 * Removes duplicate object keys.
 * @param object Input object.
 * @returns Pruned object.
 * @example removeDuplicateKeys({ a: 1, b: 2, a: 3, c: 4 }) -> { a: 3, b: 2, c: 4 }
 */
export function removeDuplicateKeys(object: object,
                                    ignoreArrays=false): object {
  return Object.keys(object)
    .map(k => {
      const key = k as keyof typeof object;
      const value = object[key];
      return {
        [key]: typeof value === 'object'
          ? Array.isArray(value) ? (ignoreArrays && value?.[0] || value) : []
          : value
      };
    }).reduce((r, c) => Object.assign(r, c), {});
};

// This needs to be kept in sync with scripts/lib/json-utils.cjs.
/**
 * Deeply merge properties from multiple objects.
 * @param target Object to merge properties with.
 * @param sources Objects() to merge properties from.
 * @returns Mutated target object.
 */
export function deepAssign(target: any, ...sources: any[]) {
  for (const source of sources) {
    for (let k in source) {
      let vs = source[k], vt = target[k];
      // Trivialize branching if either value is null or undefined
      if (vs == null || vt == null) {
        if (vs != null) target[k] = vs; continue
      // If at least the target is an array.
      } else if (Array.isArray(vt)) {
        target[k] = vt.concat(vs) as typeof target[typeof k];
      // If only the source is an array.
      } else if (Array.isArray(vs)) {
        target[k] = vs.concat(vt) as typeof target[typeof k];
      // If both the target and source are objects.
      } else if (Object(vs) == vs && Object(vt) === vt) {
        target[k] = deepAssign(vt, vs);
      // Overwrite the target.
      } else {
        target[k] = source[k];
      }
    }
  }
  return target;
};
