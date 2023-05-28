/* @file
 * Utilities for controlling data mocking for lz4 testing.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';


export const filepath = join(__dirname, 'test');
export const json = require('../../../../../package.json');
export const metadata = { timestamp: new Date(), "a": 1, "b": 2.0, "c": "3" };


export default function () {
  for (let i = 0; i < 3; i++) {
    for (const artifact of ['.catalog.json', '.collection.lz4']) {
      const filepath = join(__dirname, `test${i}${artifact}`);
      if (existsSync(filepath)) unlinkSync(filepath);
    };
  };
};
