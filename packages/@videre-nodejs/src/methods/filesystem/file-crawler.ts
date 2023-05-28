/* @file
 * File crawler and file-utility functions.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { join } from 'path';
import { readdirSync, lstatSync } from 'fs';


type Pattern = string | RegExp;

export interface Filters {
  include: Pattern | Pattern[];
  exclude: Pattern | Pattern[];
};

/**
 * Evaluates a string against include and exclude regex filters.
 * @param text Text to evaluate against the filter.
 * @param filters Include and exclude filters to apply.
 * @returns Returns true if the text matches the include and exclude filters.
 */
export function evaluateFilters(text: string, filters: Filters) {
  const match = (text: string, filter: Pattern) => {
    if (filter instanceof RegExp) return filter.test(text);
    try {
      const m = filter.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
      const regex = m ? new RegExp(m[2], m[3]) : new RegExp(filter);
      return regex.test(text);
    } catch (e) {
      return text.includes(filter);
    }
  }
  const test = (filter: Pattern | Pattern[], any: boolean) =>
    filter instanceof Array
      ? filter.reduce((acc, filter) => any
          // logical OR: any filter must match
          ? acc || match(text, filter)
          // logical AND: all filters must match
          : acc && match(text, filter),
        !any)
      : match(text, filter);
  return test(filters.include, true) && !test(filters.exclude, false);
};

/**
 * Evaluates an syncronous or asyncronous function.
 * @param fn Input function to evaluate.
 * @param args Input arguments to pass to the function.
 * @returns Function output.
 */
export async function evaluateFn(fn: Function, ...args: any) {
  const output = fn(...args);
  // return (output instanceof Promise) ? await output : output;
  return output;
};


/**
 * Recursively traverse across a directory and run a callback on each file.
 * @param rootDir Base directory to start traversing from.
 * @param filter Regex filter to apply to each file syncronously.
 * @param callback Syncronous or asyncronous function to run on each file.
 */
export async function crawler(rootDir: string, filters: Filters, callback: Function) {
  const files = readdirSync(rootDir);
  const len = files.length;
  for (let i = 0; i < len; ++i) {
    const filename = join(rootDir, files[i]);
    try {
      if (lstatSync(filename).isDirectory()) {
        await crawler(filename, filters, callback);
      } else if (evaluateFilters(filename, filters)) {
        await evaluateFn(callback, filename);
      }
    } catch (e) {}
  };
};