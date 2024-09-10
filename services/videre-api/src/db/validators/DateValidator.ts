/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error } from 'itty-router';


/**
 * Verifies that a value is a parsable date.
 */
export const DateValidator = (
  params: any,
  key: string,
  value: any
): Response | void => {
  const date = new Date(value);
  if (isNaN(date.getTime()))
    return error(400, `Invalid ${key} specified: '${value}'`);

  params[key] = date;
}
