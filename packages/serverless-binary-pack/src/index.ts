/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { join, parse } from 'node:path';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

import splitBundle from './bundle';
import writeBrotliChunks, { CompressOptions } from './chunks';
import extractBinary from './extract';


export interface PackOptions extends CompressOptions {
  /**
   * Number of chunks to split the binary into. (Default 8)
   */
  num_chunks?: number;

  /**
   * Maximum bundle size in bytes. (Default 45MB)
   */
  max_size?: number;
}

export async function pack(
  binaryPath: string,
  outDir: string,
  { num_chunks=8, max_size=45<<20, ...brotliOptions }: PackOptions
) {
  const buffer = readFileSync(binaryPath);
  const basename = parse(binaryPath).name;

  const chunkDir = join(tmpdir(), `${basename}-chunks`);
  const chunklist = await writeBrotliChunks(buffer, basename, chunkDir, {
    num_chunks,
    options: brotliOptions
  });

  const packing = await splitBundle(chunklist, max_size, {
    basename,
    chunkDir,
    outDir
  });

  return packing;
};

export async function extract(
  bundlePaths: string[],
  outDir: string
) {
  const binaryPath = await extractBinary(bundlePaths, outDir);

  return binaryPath;
};
