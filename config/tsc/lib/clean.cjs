/* @file
 * Supplemental build cleanup script for package.json `clean` script.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path')
const fs = require('fs')


const cwd = process.argv[2]
const tsconfig = require(path.join(__dirname, '../tsconfig.cjs'))(
  path.join(cwd, 'tsconfig.json'))

const outDir = tsconfig?.outDir || path.join(cwd, 'build')
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true })
