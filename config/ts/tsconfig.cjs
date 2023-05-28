/* @file
 * Base tsconfig methods file for Typescript projects.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path')
const fs = require('fs')

const { deepAssign }  = require('@videre/js')


function tsconfig(filepath=path.join(process.cwd(), 'tsconfig.json')) {
  if (!fs.existsSync(filepath)) throw new Error(`tsconfig.json not found at ${filepath}`)

  let config = require(filepath)
  // Merge properties from specified `extends` tsconfig.
  if (config?.extends) {
    const extendedConfig = path.join(path.dirname(filepath), config.extends)
    config = deepAssign(config, require(extendedConfig))
  }

  return config;
}


module.exports = tsconfig