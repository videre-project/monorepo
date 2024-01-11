/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error } from 'itty-router';
import { toPascalCase } from '@videre/js';

import { FORMATS } from './constants';
import type { FormatType } from './types';


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
