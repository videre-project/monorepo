/* @file
 * 
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { createHash } from 'crypto';
import { writeFileSync, readFileSync } from 'fs';

import { writeLz4Json } from './json';


/**
 * Read catalog file for a given datastore collection type.
 */
export function readCatalog(filepath: string): object | JSON {
  const raw = readFileSync(filepath);
  // @ts-ignore - JSON.parse() supports parsing `Buffer` types.
  try { return JSON.parse(raw); } catch (e) { return {}; }
};

/**
 * Write a collection datastore to disk using lz4 compression.
 */
export function writeCollection(data: object | JSON, filepath: string,
                                metadata={ timestamp: new Date() }) {
  // Write data with lz4 compression, returning compression details
  const lz4 = writeLz4Json(data, filepath + '.collection.lz4');

  // Get hash sum of buffered json
  const hashSum = createHash('sha256');
  hashSum.update(Buffer.from(JSON.stringify(data)));

  // Write catalog to disk with file & compression metadata
  const { timestamp, ...details } = metadata;
  const catalog = {
    object: 'catalog',
    timestamp,
    compression: { ...lz4, sha256: hashSum.digest('hex') },
    details
  };
  writeFileSync(filepath + '.catalog.json', JSON.stringify(catalog));

  return catalog;
};
