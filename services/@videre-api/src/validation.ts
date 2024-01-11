/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error } from 'itty-router';
import { toPascalCase } from '@videre/js';

import { FORMATS } from './db/constants';
import type { FormatType } from './db/types';
import type { IProxy } from './parameters';


/**
 * Verifies that a given format is a valid FormatType.
 */
export const Format = (format: string): Response | void => {
  if (!FORMATS.includes(toPascalCase(format) as FormatType))
    return error(400, `Invalid format specified: '${format}'`);
}

/**
 * Verifies all parameters in a request.
 * @param params A map of parameter names to validation functions.
 * @returns A middleware function that validates the given parameters.
 */
export const withValidation = (
  params: { [key in string]: (value: any) => any }
) => {
  return ({ proxy }: IProxy) => {
    for (const [key, validator] of Object.entries(params)) {
      if (proxy[key] !== undefined) {
        const result = validator(proxy[key]);
        if (result) return result;
      }
    }
  }
}
