/* @file
 * Brotli chunk writing methods and worker utilities.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { join, basename } from 'path';
import { existsSync, mkdirSync, writeFileSync, statSync } from 'fs';
import { createHash } from 'crypto';

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

import { setDelay } from '@videre/js';

import { compress } from 'brotli';


export interface CompressOptions {
  /**
   * The Brotli compression mode. Possible modes are:
   * 0 - generic (default)
   * 1 - text (for UTF-8 format text input)
   * 2 - font (WOFF2)
   */
  mode?: 0 | 1 | 2 | undefined;
  /**
   * The Brotli quality level, possible levels are 0-11. The default level is 11.
   */
  quality?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | undefined;
  /**
   * The LZ77 window size, default is 22.
   */
  lgwin?: number | undefined;
}

export interface ChunkOptions {
  /**
   * The number of chunks to split the file into. The default number is 8.
   */
  num_chunks: number;
  /**
   * Brotli compression options.
   */
  options?: CompressOptions;
};

export interface Chunklist {
  [index: string]: {
    hash: string;
    size: number;
  };
}

export default async function writeBrotliChunks(
  /**
   * Input file buffer.
   */
  buffer: Buffer,
  /**
   * Basename of file to name chunks
   */
  basename: string,
  /**
   * Directory to write chunks to
   */
  outDir: string,
  /**
   * Input chunk options.
   */
  { num_chunks=8, options }: ChunkOptions
): Promise<Chunklist> {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // Queue workers to compress each chunk asynchronously
  const len = buffer.length;
  const chunk_size = Math.ceil(len / num_chunks);
  let threads: Set<Worker> = new Set();
  for (let i = 0; i < len; i += chunk_size) {
    const index = String.fromCharCode((i / chunk_size) + 'A'.charCodeAt(0));
    const filepath = join(outDir, `${basename}.${index}.br`);
    const chunk = buffer.subarray(i, i + chunk_size);
    threads.add(new Worker(__filename, { workerData: { filepath, chunk, options } }));
  };

  // Build chunklist as each chunk is compressed.
  let chunklist = {} as any;
  for (let worker of threads) {
    worker.on('error', (err) => { throw err; });
    worker.on('message', ([index, part]) => { chunklist[index] = part; });
    worker.on('exit', () => threads.delete(worker));
  };

  // Wait until all threads have exited before saving chunklist.
  while (threads.size > 0) { await setDelay(100); }
  writeFileSync(join(outDir, `${basename}.chunklist`), JSON.stringify(chunklist));

  // Return chunklist
  return chunklist;
};


// Worker thread
if (!isMainThread) { runWorker(workerData as workerOptions); process.exit(0); }


interface workerOptions {
  filepath: string;
  chunk: Buffer;
  options?: CompressOptions;
}

function runWorker({ filepath, chunk, options }: workerOptions) {
  // Write chunk to disk
  const chunk_br = compress(chunk, options);
  writeFileSync(filepath, chunk_br);
  
  // Update chunklist
  parentPort!.postMessage([basename(filepath), {
    hash: createHash('sha256').update(chunk).digest('hex'),
    size: statSync(filepath).size
  }]);
};
