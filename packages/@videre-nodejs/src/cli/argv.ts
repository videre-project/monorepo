/* @file
 *
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Parse argv flags by arg name/aliases
 */
export const getArgs = (args: string[], flags: string[], offset = 1) => {
  const opt = flags.filter(o => args.includes(o))?.[0];
  return args[args.indexOf(opt)+offset] || null;
};
