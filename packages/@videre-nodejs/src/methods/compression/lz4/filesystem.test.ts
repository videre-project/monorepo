/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { existsSync } from 'fs';

import { waitUntil } from '@videre/js';

import { describe, test, it, expect } from '@jest/globals';

import { filepath, json } from './__mock__';
import { readLz4, readLz4Sync, writeLz4Sync } from './filesystem';


describe('writeLz4Sync', () => {
  test('writes lz4 collection from JSON to disk', async () => {
    writeLz4Sync(filepath + '1.collection.lz4', JSON.stringify(json));
    await waitUntil(() => existsSync(filepath + '1.collection.lz4'));
    const raw = readLz4Sync(filepath + '1.collection.lz4');
    // @ts-ignore - JSON.parse() supports parsing `Buffer` types.
    const output = JSON.parse(raw);
    const expected = JSON.parse(JSON.stringify(json));
    expect(output).toEqual(expected);
  }, 10 * 1e3);
});

describe('readLz4', () => {
  test('depends on `writeLz4Sync` test', async () =>
    await waitUntil(() => existsSync(filepath + '1.collection.lz4')), 5 * 1e3);
  test('reads lz4 collection from disk to JSON', async () => {
    const raw = await readLz4(filepath + '1.collection.lz4');
    // @ts-ignore - JSON.parse() supports parsing `Buffer` types.
    const output = JSON.parse(raw);
    const expected = JSON.parse(JSON.stringify(json));
    expect(output).toEqual(expected);
  });
});

describe('readLz4Sync', () => {
  test('depends on `writeLz4Sync` test', async () =>
    await waitUntil(() => existsSync(filepath + '1.collection.lz4')), 10 * 1e3);
  it('reads lz4 collection from disk to JSON', () => {
    const raw = readLz4Sync(filepath + '1.collection.lz4');
    // @ts-ignore - JSON.parse() supports parsing `Buffer` types.
    const output = JSON.parse(raw);
    const expected = JSON.parse(JSON.stringify(json));
    expect(output).toEqual(expected);
  });
});
