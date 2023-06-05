/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { createWriteStream, createReadStream, readFileSync } from 'fs';
import type { WriteStream } from 'fs';
import { join, parse } from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import { createBrotliDecompress } from 'zlib';

import MultiStream from 'multistream';


/**
 * Input buffer ranges for each bundle type, determined by `max_size`.
 */
interface Targets { bundle: number[]; offload?: number[]; }

/**
 * Pack a binary file into brotli-compressed `.br` files of size `max_size`.
 * @param binaryPath Filepath to binary file to pack.
 * @param outDir Directory to write the packed files to. (Default `tmpdir()`)
 * @param max_size Maximum size of each bundle. (Default 45 MB)
 * @returns An array of filepaths to the packed files.
 */
export async function pack(binaryPath: string, outDir: string=tmpdir(),
                           max_size=45<<20) {
  const buffer = readFileSync(binaryPath);
  const basename = parse(binaryPath).name;

  const targets = { bundle: [0, max_size], offload: [max_size] } as Targets;
  if (buffer.length < max_size) delete targets.offload;

  let bundles = new Set() as Set<string>;
  for (const [kind, slice] of Object.entries(targets)) {
    const subBuffer = buffer.subarray(...slice);
    bundles.add(await new Promise((resolve, reject) => {
      const stream: WriteStream = Readable.from(subBuffer)
        .pipe(createWriteStream(join(outDir, `${basename}.${kind}.br`)))
          .once('error', reject)
          .once('finish', () => resolve(stream.path as string));
    }));
  };

  return Array.from(bundles) as string[];
};

/**
 * Extract a set of brotli-compressed `.br` files into a binary file.
 * @param bundlePaths Filepaths to brotli-compressed `.br` files to extract.
 * @param outDir Directory to write the binary file to. (Default `tmpdir()`)
 * @returns A filepath to the extracted binary file.
 */
export async function extract(bundlePaths: string[], outDir: string=tmpdir()) {
  const basename = parse(bundlePaths[0]).name.replace(/.[a-z]+.br/g, '');
  const binaryPath = await new Promise((resolve, reject) => {
    const stream: WriteStream = new MultiStream(bundlePaths
          .map((path) => createReadStream(path, { highWaterMark: 8<<20 })))
      .pipe(createBrotliDecompress({ chunkSize: 2<<20 /* 2 KB */ }))
      .pipe(createWriteStream(join(outDir, `${basename}.recovered`)))
        .once('error', reject)
        .once('finish', () => resolve(stream.path as string));
  });

  return binaryPath as string;
};
