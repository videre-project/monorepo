/* @file
 * Methods for optimizing packaging chunks into bundles.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import path, { join } from 'path';
import { readFileSync, createWriteStream, rmSync, statSync } from 'fs';
import { createHash } from 'crypto';

import { setDelay } from '@videre/js';

import { pack } from 'tar-fs';

import { Chunklist } from './chunks';


export interface BundleOptions {
  /**
   * Basename of file to name chunks.
   */
  basename: string;
  /**
   * Basename of file to name chunks.
   */
  chunkDir: string;
  /**
   * Directory to write bundled chunks to.
   */
  outDir: string;
};

export default async function splitBundle(
  /**
   * Input chunklist file.
   */
  chunklist: Chunklist,
  /**
   * Maximum size (in MB) to optimize for bundling.
   */
  max_size: number,
  /**
   * Input bundle options.
   */
  { chunkDir, basename, outDir }: BundleOptions
) {
  // Pack files until reaching the desired maximum size
  const packing = Object.entries(chunklist)
    .map(([filepath, { size }]) => ({ filepath, size }))
    .sort((a,b) => b.size - a.size)
    .reduce((acc, { filepath, size }) => {
        // @ts-ignore - Coerce type as number.
        const bundle_total: number = Object.values(acc.bundle)
          ?.reduce((acc, k: any) => acc + k.size, 0);
        const reached_limit = bundle_total + size >= max_size;
        const kind = reached_limit ? 'offload' : 'bundle';
        acc[kind][filepath] = chunklist[filepath];
        return acc;
      }, { bundle: {} as any, offload: {} as any });
  
  // Create separate gzip archives for each kind of bundle
  let bundles = new Set() as Set<[string, string, string, number]>;
  Object.entries(packing)
    .forEach(([kind, chunks]) => {
      const bundle_name = join(outDir, `${basename}-${kind}.tar`);
      pack(chunkDir, {
        entries: kind === 'bundle'
          ? [...Object.keys(chunks), `${basename}.chunklist`]
          : Object.keys(chunks),
        finish: () => bundles.add([
          kind,
          path.basename(bundle_name),
          createHash('sha256').update(readFileSync(bundle_name)).digest('hex'),
          statSync(bundle_name).size
        ])
      }).pipe(createWriteStream(bundle_name));
    });
  
  // Cleanup chunks directory after all bundles are written
  while (bundles.size !== Object.keys(packing).length) { await setDelay(100); }
  rmSync(chunkDir, { recursive: true, force: true });

  const results = Array.from(bundles)
    // Sort bundles by file size
    .sort(([_a0,_a1,_a2, size_a], [_b0,_b1,_b2, size_b]) => size_b - size_a)
    // Merge size and chunklist entries for each kind of bundle
    .reduce((acc: any, [kind, filename, hash, size]) => {
        // @ts-ignore - `packing` object can be indexed by a string type
        acc[filename] = { size, hash, chunks: packing[kind] }; return acc;
    }, {});

  return results;
};
