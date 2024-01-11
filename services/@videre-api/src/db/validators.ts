/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error } from 'itty-router';
import { toPascalCase } from '@videre/js';

import { FORMATS } from './constants';
import type { FormatType } from './types';


export const FormatValidator = (
  params: any,
  key: string,
  value: any
): Response | void => {
  const format = toPascalCase(value) as FormatType;
  if (!FORMATS.includes(format))
    return error(400, `Invalid ${key} specified: '${format}'`);

  params[key] = format;
}

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
