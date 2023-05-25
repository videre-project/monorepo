/* @file
 * Suppresses experimental warnings emmitted from NodeJS.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/
// @ts-nocheck


export const SUPPRESS_WARNINGS_ENABLE = process.argv.includes('--suppress-experimental');

// TODO: add args for adding custom listener.
export function suppressWarnings() {
  const originalEmit = process.emit;

  // @ts-ignore - NodeJS process type not properly tracked from originalOmit.
  process.emit = function (name: string, data, ...args) {
    if (
      (name === 'warning' &&
       typeof data === 'object' &&
       data.name === 'ExperimentalWarning') ||
      (data.message.includes('--experimental') ||
       data.message.includes('is an experimental feature') ||
       data.message.includes('is experimental') ||
       data.message.includes('Use `node --trace-warnings ...`'))
    ) return false;

    return originalEmit.apply(process, arguments);
  };
};
