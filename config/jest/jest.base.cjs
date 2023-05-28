/* @file
 * Base Jest configuration file for Typescript projects.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path')

const { deepAssign }  = require('@videre/js')


function baseConfig({ plugins, config, ...options }) {
  config = deepAssign({
    testEnvironment: 'node',
    modulePathIgnorePatterns: [
      '<rootDir>/build/',
    ],
    modulePaths: ['<rootDir>']
  }, config)

  // Add custom jest hooks for custom setup + teardown scripts.
  if (options?.hooks) {
    for (let hook in options?.hooks) {
      if (options.hooks.hasOwnProperty(hook))
        config[hook] = path.join(__dirname, 'jest.hooks.ts')
    }
  }

  const tsconfig = require(path.join(__dirname, '../tsc/tsconfig.cjs'))()
  // Add `moduleNameMapper` properties from tsconfig `paths`.
  if (plugins?.ts_jest && tsconfig?.compilerOptions?.paths) {
    config['moduleNameMapper'] = plugins.ts_jest.pathsToModuleNameMapper(
      tsconfig.compilerOptions.paths,
      { prefix: '<rootDir>' }
    )
  }

  return new Proxy(config, {
    // Hide `plugins` and `options` properties from Jest validator.
    get: (target, prop) => {
      if (prop === 'plugins') return plugins
      if (prop === 'options') return options
      return target[prop]
    }
  })
}


module.exports = baseConfig