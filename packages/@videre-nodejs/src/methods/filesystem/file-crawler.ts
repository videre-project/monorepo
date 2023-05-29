/* @file
 * File crawler and file-utility functions.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { join } from 'path';
import { readdirSync, lstatSync } from 'fs';


import { evaluateFn } from '@videre/js';


type Pattern = string | RegExp;

export interface Filters {
  include: Pattern | Pattern[];
  exclude: Pattern | Pattern[];
};

/**
 * Returns a string of file extensions patterns.
 * @param args An array of `Pattern` or `Pattern[]` file extensions.
 * @returns A concatenated string of file extension patterns.
 */
export function mergeFileExtensions(...args: Array<Pattern | Pattern[]>) {
  return Array.from(new Set(args.flat()
      .reduce((acc: Set<string>, s: Pattern) => {
        const pattern = (typeof s === 'string' && s
            // Allow for consuming regular expressions
            || s?.toString().replace(/\/\\|\$\//g,''))
          // Remove extension delimiter
          .replace(/^./, '');
        return acc.has(pattern) ? acc : acc.add(pattern);
      }, new Set())))
    .sort((a: string, b: string) => a.length - b.length)
    .reduce((acc: string, s: string) => acc.length ? `${acc}|${s}` : s, '')
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
        // Recurse into sub-directory
        await crawler(filename, filters, callback);
      } else if (evaluateFilters(filename, filters)) {
        // Run callback on filename
        await evaluateFn(callback, filename);
      }
    } catch (e) {}
  };
};
