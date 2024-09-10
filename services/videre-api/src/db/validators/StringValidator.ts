/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error } from 'itty-router';


/**
 * Verifies that a value is well formed string without any exotic characters.
 */
export const StringValidator = (
  params: any,
  key: string,
  value: any
): Response | void => {
  const string = String(value);
  // \p{L}  - matches any kind of letter from any language.
  // \p{Nd} - matches a decimal digit character.
  // \p{P}  - matches any kind of punctuation character.
  // \s     - matches any kind of whitespace character.
  if (!/^[\p{L}\p{Nd}\p{P}\s]+$/u.test(string))
    return error(400, `Invalid ${key} specified: '${value}'`);

  params[key] = string;
}
