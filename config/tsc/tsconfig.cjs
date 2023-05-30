/* @file
 * Base tsconfig methods file for Typescript projects.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path')
const fs = require('fs')

const { deepAssign }  = require('@videre/js')

const ts = require('typescript')


function tsconfig(filepath=path.join(process.cwd(), 'tsconfig.json')) {
  const pwd = path.dirname(filepath)
  if (!fs.existsSync(filepath)) {
    filepath = ts.findConfigFile(pwd, ts.sys.fileExists, 'tsconfig.json')
    if (!filepath) throw new Error(`\`tsconfig.json\` not found at ${filepath}`)
  }

  /** @type {ts.TsConfigSourceFile} */
  let config = ts.readConfigFile(filepath, ts.sys.readFile).config
  // Recurse and merge properties from specified `extends` tsconfig.
  if (config?.extends) {
    config = deepAssign(config, tsconfig(path.join(pwd, config.extends)))
  }

  return config
}


module.exports = tsconfig