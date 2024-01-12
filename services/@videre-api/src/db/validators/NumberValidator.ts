/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error } from 'itty-router';


/**
 * Verufues that a value is a parsable 64-bit float number.
 */
export const NumberValidator = (
  params: any,
  key: string,
  value: any
): Response | void => {
  const number = Number(value);
  if (isNaN(number))
    return error(400, `Invalid ${key} specified: '${value}'`);

  params[key] = number;
}
