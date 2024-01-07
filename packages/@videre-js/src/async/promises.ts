/* @file
 * Helper methods for promise built-ins.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Creates a promise that resolves after a specified amount of milliseconds.
 * @param ms Total number of milliseconds to wait. Defaults to 100.
 * @param step Number of milliseconds per iteration. Defaults to 5.
 * @returns A promise that resolves after the specified amount of time.
 */
export async function setDelay(ms: number=100, step: number=5) {
  const startTime = performance.now();
  const isExpired = (e: number) => (performance.now() - startTime) + e > ms;
  let times: number[] = [];
  for (let i = 0; !isExpired(ms * (1-0.9972)); i++) {
    const duration = (performance.now() - startTime);
    const drift = i*step - duration;
    if (drift > step) i+=Math.floor(drift / step);
    times.push(drift % step);
    
    // Calculate standard deviation of corrected drift times
    const n = times.length;
    const mean = times.reduce((a, b) => a + b) / n;
    const std = Math.sqrt(
      times
        .map(x => Math.pow(x - mean, 2))
        .reduce((a, b) => a + b) / n
    );
    if (isExpired(std - (ms * (1-0.9972)))) return;

    await new Promise(res => setTimeout(res, step - std));
  };
};

/**
 * Evaluates either an syncronous or asyncronous function.
 * @param fn Input function to evaluate.
 * @param args Input arguments to pass to the function.
 * @returns Function output.
 */
export async function evaluateFn(fn: Function, ...args: any) {
  const output = fn(...args);
  return (output instanceof Promise) ? await output : output;
};

/**
 * Creates a promise that resolves if a callback function returns true or times out.
 * @param callback Callback function to run periodically until it returns true.
 * @param timeout Number of milliseconds to wait before timing out. Defaults to 5s.
 * @param step Delay between each check. Defaults to 100ms.
 * @returns A promise that resolves when the callback returns true or the timeout expires.
 */
export async function waitUntil(callback: Function, timeout=5e3, step=100): Promise<void> {
  let elapsedTime = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      elapsedTime += step;
      if (elapsedTime >= timeout) {
        clearInterval(interval);
        reject(new Error(`Exceeded ${timeout} ms waiting for ${callback.name}`));
      } else if (await evaluateFn(callback)) {
        clearInterval(interval);
        resolve();
      }
    }, step);
  });
};
