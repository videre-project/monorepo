/* @file
 * Methods for extracting bundled chunks and recovering source binaries.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { join, basename } from 'path';
import { createReadStream, readdirSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'fs';
import { createHash } from 'crypto';

import { tmpdir } from "node:os";
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

import { setDelay } from '@videre/js';

import { decompress } from 'brotli';
import { extract } from 'tar-fs';

export default async function extractBinary(
  bundles: string[],
  outDir=tmpdir()
) {
  const filename = basename(bundles[0]).replace(/-.*/g, '');
  // Create temporary directory for extracted bundles
  const extractDir = join(outDir, `${filename}-chunks`);
  // Extract each bundle to a shared temporary directory
  for (let i = 0; i < bundles.length; i++) {
    await new Promise((resolve, reject) =>
      createReadStream(bundles[i])
        .pipe(extract(extractDir, { readable: true }))
        .on('error', reject)
        .on('finish', resolve)
    );
  };
  // @ts-ignore - Buffer types can be parsed with JSON.parse()
  const chunklist = JSON.parse(readFileSync(join(extractDir, `${filename}.chunklist`)));
  const chunks = readdirSync(extractDir)
    .filter(f => !f.endsWith('.chunklist'))
    .map(file => join(extractDir, file));

  // Queue workers to decompress each chunk asynchronously
  let threads: Set<Worker> = new Set();
  for (let i = 0; i < chunks.length; i++) {
    const filepath = chunks[i];
    const { hash } = chunklist[basename(filepath)];
    const index = basename(filepath)
      .replace(new RegExp(`${filename}.|.br`, 'g'), '')
      .charCodeAt(0) - 'A'.charCodeAt(0);
    threads.add(new Worker(__filename, { workerData: { index, filepath, hash } }));
  };

  // Index binary parts as each chunk is decompressed.
  let binary_chunks = {} as { [index: number]: Buffer };
  for (let worker of threads) {
    worker.on('error', (err) => { throw err; });
    worker.on('message', ([index, { ipc_hash, chunk }]) => {
      const hash = createHash('sha256').update(chunk).digest('hex');
      if (hash !== ipc_hash)
        throw new Error(`Chunk ${index + 'A'.charCodeAt(0)} was corrupted over IPC.`);
      else
        binary_chunks[index] = chunk;
    });
    worker.on('exit', () => threads.delete(worker));
  };

  // Wait until all threads have exited before re-sorting binary chunks.
  while (threads.size > 0) { await setDelay(100); }
  binary_chunks = Object.entries(binary_chunks)
    // @ts-ignore - Typescript does not track the index type correctly
    .sort(([index_a, _a], [index_b, _b]) => index_a - index_b)
    .reduce((acc: any, [index, buf]) => { acc[index] = buf; return acc; }, {});

  // Clean up temporary directory
  rmSync(extractDir, { recursive: true, force: true });

  // Write binary to disk
  const filepath = join(outDir, filename);
  writeFileSync(filepath, Buffer.concat(Object.values(binary_chunks)));
  chmodSync(filepath, '755');

  // Return binary path
  return filepath;
};


// Worker thread
if (!isMainThread) { runWorker(workerData as workerOptions); process.exit(0); }


interface workerOptions {
  index: number;
  filepath: string;
  hash: string;
}

function runWorker({ index, filepath, hash }: workerOptions) {
  // Decompress chunk from disk
  const chunk_br = readFileSync(filepath);
  const chunk = decompress(chunk_br);

  // Validate chunk hash
  const ipc_hash = createHash('sha256').update(chunk).digest('hex');
  if (hash !== ipc_hash)
    throw new Error(`Chunk ${index + 'A'.charCodeAt(0)} was corrupted.`);
  
  // Update binary
  parentPort!.postMessage([index, { ipc_hash, chunk }]);
};
