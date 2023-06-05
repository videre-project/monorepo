/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { createHash } from 'crypto';
import { readFileSync, unlinkSync } from 'fs';
import { join, basename } from 'path';

import { afterAll, describe, it, expect } from '@jest/globals';

import { pack, extract } from './index';


const BINARY = 'chromium';
const SHA256 = '6ac3733f00ad8d2db43384d87a162a889634c37a37dc147f76aaba499bbf89a0';

const BIN_DIR = join(__dirname, '..', 'bin');
const BINARY_PATH = join(BIN_DIR, `${BINARY}.br`);

let bundles: string[];
describe('pack', () => {
  const MAX_SIZE = 45<<20; // 45 MB (binary)
  it('should create two binaries split at the max size', async () => {
    bundles = Array.from(await pack(BINARY_PATH, BIN_DIR, MAX_SIZE));
    expect(bundles.map((b: string) => basename(b)))
      .toEqual([`${BINARY}.bundle.br`, `${BINARY}.offload.br`])
  });
});

let binaryPath: string;
describe('extract', () => {
  it('should be read and decompressed in under 3 seconds', async () => {
    const startTime = performance.now();
    binaryPath = await extract(bundles, BIN_DIR);
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(3 * 1e3);
  });
  it('should recover the original decompressed binary', () => {
    const buffer = readFileSync(binaryPath);
    const output = createHash('sha256').update(buffer).digest('hex');
    expect(output).toBe(SHA256);
  });
});

afterAll(() => { [...bundles, binaryPath].forEach(p => unlinkSync(p)); });
