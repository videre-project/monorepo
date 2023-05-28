/* @file
 * Helper methods for promise built-ins.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Creates a promise that resolves after a specified amount of milliseconds.
 * @param ms Number of milliseconds to wait. Defaults to 100.
 * @returns A promise that resolves after the specified amount of time.
 */
export function setDelay(ms: number=100) {
  return new Promise(res => setTimeout(res, ms));
};

/**
 * Creates a promise that resolves if a callback function returns true or times out.
 * @param callback Callback function to run periodically until it returns true.
 * @param timeout Number of milliseconds to wait before timing out. Defaults to 5s.
 * @param step Delay between each check. Defaults to 100ms.
 * @returns A promise that resolves when the callback returns true or the timeout expires.
 */
export function waitUntil(callback: Function, timeout=5*1e3, step=100): Promise<void> {
  let elapsedTime = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      elapsedTime += step;
      if (elapsedTime >= timeout) {
        clearInterval(interval);
        reject(new Error(`Exceeded ${timeout} ms waiting for ${callback.name}`));
      } else if (callback()) {
        clearInterval(interval);
        resolve();
      }
    }, step);
  });
};
