/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { join } from 'path';
import { readFileSync, statSync, existsSync } from 'fs';
import { createHash } from 'crypto';

import { decompress } from 'brotli';

import { describe, it, expect } from '@jest/globals';

import splitBundle from './../build/bundle.js';
import writeBrotliChunks, { CompressOptions } from './../build/chunks.js';
import extractBinary from './../build/extract.js';


const basename = 'chromium';
const brotliOptions = { mode: 0, quality: 11 };
const num_chunks = 16;

const BIN_DIR = join(__dirname, 'bin');
const chunkDir = join(BIN_DIR, 'chunks');
const bundleDir = BIN_DIR;

const BINARY = join(BIN_DIR, `${basename}.br`);
const buffer = Buffer.from(decompress(readFileSync(BINARY)));

let chunklist = {} as any;
describe('writeBrotliChunks', () => {
  let duration = 0;
  it('to return a chunklist', async () => {
    const startTime = performance.now();
    chunklist = await writeBrotliChunks(buffer, basename, chunkDir, {
      num_chunks,
      options: brotliOptions as CompressOptions
    });
    duration = performance.now() - startTime;
    expect(JSON.stringify(chunklist) !== '{}').toBe(true);
  }, 3e6 /* 5 minute timeout */);

  it(`should write ${num_chunks} chunks`, () => {
    const chunks = Object.keys(chunklist)
      .map(c => c
        .replace(new RegExp(`${basename}.|.br`, 'g'), '')
        .charCodeAt(0) - 'A'.charCodeAt(0))
      .sort((a,b) => a - b);
    const expected = new Array(16).fill(0).map((_,i) => i); // [0,1,2, ... ,15]
    expect(chunks).toEqual(expected);
  });

  it('should perform in a reasonable amount of time', () => {
    expect(duration).toBeLessThanOrEqual(3e6); // < 5 minutes
  });

  it(`should have reasonable total throughput`, () => {
    // Measure average total throughput
    const throughput = buffer.byteLength / duration;
    // Expect at least (100 B/s * num_chunks) total throughput
    expect(throughput).toBeGreaterThanOrEqual((100 * num_chunks) * 0.9972);
  });

  it(`should have reasonable per-thread throughput`, () => {
    // Measure average per-thread throughput
    const throughput = buffer.byteLength / (duration / num_chunks);
    // Expect at least 100 B/s per-thread throughput
    expect(throughput).toBeGreaterThanOrEqual((100) * 0.9972);
  });
});

let packing = {} as any;
let bundles = [] as string[];
describe('splitBundle', () => {
  const MAX_ALLOWED_SIZE = 45<<20; // 47 MB (binary)
  it('to return a chunklist for each bundle', async () => {
    packing = await splitBundle(chunklist, MAX_ALLOWED_SIZE, {
      basename,
      chunkDir,
      outDir: bundleDir,
    });
    expect(JSON.stringify(packing) !== '{}').toBe(true);
  });

  const LOCALE_MAX_SIZE = MAX_ALLOWED_SIZE.toLocaleString();
  it(`should have less than ${LOCALE_MAX_SIZE} bytes in primary bundle`, () => {
    const bundleSize = packing[`${basename}-bundle.tar`].size;
    expect(bundleSize).toBeLessThan(MAX_ALLOWED_SIZE);
  });

  const TOTAL_ALLOWED_SIZE = Math.ceil(1.05 * statSync(BINARY).size);
  const LOCALE_TOTAL_SIZE = TOTAL_ALLOWED_SIZE.toLocaleString();
  it(`should have less than ${LOCALE_TOTAL_SIZE} bytes (+5% err) total`, () => {
    bundles = Object.keys(packing).map(f => join(bundleDir, f));
    const totalSize = bundles
      .map((f) => statSync(f).size)
      .reduce((a,b) => a + b, 0);
    expect(totalSize).toBeLessThan(TOTAL_ALLOWED_SIZE);
  });
});

let binary = '' as any;
describe('extractBinary', () => {
  let duration = 0;
  it('to return a valid binary path', async () => {
    const startTime = performance.now();
    binary = await extractBinary(bundles, BIN_DIR);
    duration = performance.now() - startTime;
    expect(binary?.length && existsSync(binary)).toBe(true);
  }, 1e4 /* 10 second timeout */);

  it('should decompress in under 10 seconds', () => {
    expect(duration).toBeLessThan(10e3);
  });

  let binary_buffer = null as any;
  it('should return a matching sha256 hash as the original binary', () => {
    binary_buffer = readFileSync(binary);
    const expected = createHash('sha256').update(buffer).digest('hex');
    const output = createHash('sha256').update(binary_buffer).digest('hex');
    expect(output).toBe(expected);
  });
});
