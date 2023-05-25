/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


// This is a js mirror of `deepAssign` from `@videre/js` - located in src/formatting/objects.ts
/**
 * Deeply merge properties from multiple objects.
 * @param {object} target Object to merge properties with.
 * @param  {...(object | Array<object>)} sources Objects() to merge properties from.
 * @returns Mutated target object.
 */
function deepAssign(target, ...sources) {
  for (const source of sources) {
    for (let k in source) {
      let vs = source[k], vt = target[k]
      if (Object(vs) == vs && Object(vt) === vt) {
        target[k] = deepAssign(vt, vs)
        continue
      }
      target[k] = source[k]
    }
  }
  return target
}

module.exports = { deepAssign };