/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { existsSync, readFileSync } from 'fs';

import { waitUntil } from '@videre/js';

import { describe, it, expect } from '@jest/globals';

import { filepath, json, metadata } from './__mock__';
import { readCatalog, writeCollection } from './artifacts';


describe('writeCollection', () => {
  test('writes lz4 collection from JSON to disk', async () => {
    const output = writeCollection(json, filepath + '0', metadata);
    await waitUntil(() => existsSync(filepath + '0.collection.lz4'));
    await waitUntil(() => existsSync(filepath + '0.catalog.json'));
    // @ts-ignore - JSON.parse() supports parsing `Buffer` types.
    const expected = JSON.parse(readFileSync(filepath + '0.catalog.json'));
    expect(JSON.parse(JSON.stringify(output))).toEqual(expected);
  }, 10 * 1e3);
});

describe('readCatalog', () => {
  test('depends on `writeCollection` test', async () =>
    await waitUntil(() => existsSync(filepath + '0.catalog.json')), 10 * 1e3);
  it('reads lz4 catalog from disk to JSON', () => {
    const output = readCatalog(filepath + '0.catalog.json') as any;
    // @ts-ignore - JSON.parse() supports parsing `Buffer` types.
    const catalog = JSON.parse(readFileSync(filepath + '0.catalog.json'));
    expect(output).toEqual(catalog);
    const { timestamp: _, ...expected } = metadata;
    expect(output.details).toEqual(expected);
  });
});
