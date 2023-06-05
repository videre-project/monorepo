/* @file
 * Methods for parallelizing a function using native worker threads.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { EventEmitter } from 'events';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

import { evaluateFn } from '@videre/js';


/**
 * Parallelize a function across multiple threads.
 * @param callback Input function to parallelize
 * @param args Array of input arguments to pass for each thread.
 * @returns An ordered array of callback outputs
 *          (`undefined[]` if no return path or `null[]` if no-op).
 */
export async function parallelize(callback: Function, args: any[]) {
  const jobHandle = new EventEmitter;
  const numWorkers = args.length;
  // Stringify function to serialize over IPC
  const ipc_callback = callback.toString();
  // Queue workers for each item in `args` array.
  let threads: Set<Worker> = new Set();
  let output = new Array(numWorkers).fill(null) as any[];
  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, {
      argv: ['--index', i, '--num-workers', numWorkers],
      name: `worker-${i}`,
      workerData: { ipc_callback, args: args[i] } as WorkerOptions
    });
    // Add worker to queue
    threads.add(worker);
    // Set emitters for each worker
    worker.on('error', (err) => { throw err; });
    worker.on('message', (data) => { output[i] = data; });
    worker.on('exit', () => {
      threads.delete(worker); if (!threads.size) jobHandle.emit('exit');
    });
  };

  // Wait until all threads have exited before returning output.
  await new Promise(res => jobHandle.once('exit', res));
  return output;
};


// Worker thread
if (!isMainThread) (async () => await runWorker(workerData as WorkerOptions))();


/**
 * Worker options.
 * @property `ipc_callback` Serialized function to execute.
 * @property `args` Arguments to pass to function.
 */
interface WorkerOptions { ipc_callback: string; args: any; }

/**
 * Worker runner function.
 */
async function runWorker({ ipc_callback, args }: WorkerOptions) {
  // Re-serialize and evaluate callback
  const callback = eval(ipc_callback) as Function;
  const output = await evaluateFn(callback, args);
  // Update main thread
  parentPort!.postMessage(output);
};
