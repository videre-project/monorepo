/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { existsSync } from 'fs';

import { waitUntil } from '@videre/js';

import { describe, test, it, expect } from '@jest/globals';

import { filepath, json } from './__mock__';
import { readCatalog } from './artifacts';
import { readLz4Json, writeLz4Json } from './json';


describe('writeLz4Json', () => {
  test('writes lz4 collection from JSON to disk', async () => {
    const output = writeLz4Json(json, filepath + '2.collection.lz4');
    await waitUntil(() => existsSync(filepath + '2.collection.lz4'));
    await waitUntil(() => existsSync(filepath + '0.catalog.json'));
    // @ts-ignore - Depend on validity of catalog method.
    const expected = readCatalog(filepath + '0.catalog.json').compression as any;
    expect(output?.compressed_size).toEqual(expected.compressed_size);
    expect(output?.uncompressed_size).toEqual(expected.uncompressed_size);
    expect(output?.compression_ratio).toEqual(expected.compression_ratio);
  }, 10 * 1e3);
});

describe('readLz4Json', () => {
  test('depends on `writeLz4Json` test', async () =>
    await waitUntil(() => existsSync(filepath + '2.collection.lz4')), 10 * 1e3);
  it('reads lz4 collection from disk to JSON', () => {
    const output = readLz4Json(filepath + '2.collection.lz4');
    expect(output).toEqual(json);
  });
  it('reads lz4 collection from disk to stringified buffer', () => {
    const output = readLz4Json(filepath + '2.collection.lz4', false);
    expect(output).toEqual(JSON.stringify(json));
  });
});
