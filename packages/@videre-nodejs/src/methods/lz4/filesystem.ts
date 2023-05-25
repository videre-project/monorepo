/* @file
 * 
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { promises as fs, writeFileSync, readFileSync } from 'fs';

import { uncompress, uncompressSync, compressSync } from 'lz4-napi';


/**
 * 
 * @param path 
 * @param options 
 * @returns 
 */
export async function readLz4(path: string, options?: object) {
  const output = await fs.readFile(path, options);
  return await uncompress(output);
};

/**
 * 
 * @param path 
 * @param options 
 * @returns 
 */
export function readLz4Sync(path: string, options?: object) {
  const output = readFileSync(path, options);
  return uncompressSync(output);
};

/**
 * 
 * @param path 
 * @param data 
 * @param dict 
 * @param options 
 */
export function writeLz4Sync(path: string,
                            data: string | Buffer,
                            dict?: string | Buffer,
                            options?: object) {
  const input = compressSync(data, dict);
  writeFileSync(path, input, options);
};
