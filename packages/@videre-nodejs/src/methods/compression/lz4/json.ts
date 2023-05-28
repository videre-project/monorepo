/* @file
 * 
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { statSync } from 'fs';

import { formatBytes } from '@videre/js';

import { decompress_benchmark } from './benchmark';
import { readLz4Sync, writeLz4Sync } from './filesystem';


/**
 * Read JSON data synchronously from disk using lz4 decompression
 * @param filepath
 * @param serialize 
 * @returns 
 */
export function readLz4Json(filepath: string, serialize=true): JSON {
  const buf = readLz4Sync(filepath);
  // @ts-ignore - Typescript cannot properly map NodeJS buffer methods.
  return serialize ? JSON.parse(buf) : buf.toString();
};

/**
 * Write JSON data synchronously to disk using lz4 compression
 * @param data 
 * @param filepath 
 * @returns 
 */
export function writeLz4Json(data: object | JSON, filepath: string) {
  // Write data with lz4 compression
  const stringified = JSON.stringify(data);
  writeLz4Sync(filepath, Buffer.from(stringified));

  // Report compression statistics
  const compressed_size = statSync(filepath).size;
  const uncompressed_size = Buffer.byteLength(stringified);
  const compression_ratio = uncompressed_size / compressed_size;
  
  // const max_time = uncompressed_size * (500 * 2**20); // < 500 MB/s
  const decompression_time = decompress_benchmark(filepath);

  return {
    algorithm: 'lz4',
    kind: 'lz77',
    compressed_size: formatBytes(compressed_size),
    uncompressed_size: formatBytes(uncompressed_size),
    compression_ratio: Number(compression_ratio.toFixed(4)),
    decompression_time
  };
};
