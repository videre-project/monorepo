/* @file
 * Helper methods for async/await built-ins.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Creates a promise that resolves after a specified amount of milliseconds.
 */
export function setDelay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
};
