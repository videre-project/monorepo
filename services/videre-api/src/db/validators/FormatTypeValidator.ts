/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error } from 'itty-router';

import { FORMATS } from '@/db/constants';
import type { FormatType } from '@/db/types';

const toPascalCase = (text: string): string =>
  text.replace(/(?:^|[_\s-])(\w)/g, (_, c) => c.toUpperCase());


/**
 * Verifies that a value is a valid FormatType.
 */
export const FormatTypeValidator = (
  params: any,
  key: string,
  value: any
): Response | void => {
  const format = toPascalCase(value) as FormatType;
  if (!FORMATS.includes(format))
    return error(400, `Invalid ${key} specified: '${format}'`);

  params[key] = format;
}
