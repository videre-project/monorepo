/* @file
 * Base Jest configuration file for Typescript projects.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path')

const { deepAssign }  = require('@videre/js')


function baseConfig({ config, plugins, ...options }) {
  config = deepAssign({
    testEnvironment: 'node',
    modulePathIgnorePatterns: [
      '<rootDir>/build/',
    ],
    modulePaths: ['<rootDir>']
  }, config)

  // Typescript options require the `ts-jest` plugin.
  if (plugins?.ts_jest) {
    const tsconfig = require(path.join(__dirname, '../tsc/tsconfig.cjs'))()
    // Add `moduleNameMapper` properties from tsconfig `paths`.
    if (tsconfig?.compilerOptions?.paths) {
      config['moduleNameMapper'] = plugins.ts_jest.pathsToModuleNameMapper(
        tsconfig.compilerOptions.paths,
        { prefix: '<rootDir>' }
      )
    }
    // Add controller script for `globalSetup` + `globalTeardown` hooks.
    if (options?.hooks
        && ('globalConfig' in options.hooks
         || 'globalTeardown' in options.hooks)) { 
      for (let hook in options?.hooks) {
        // Only add controller if hook does not already exist.
        if (!config.hasOwnProperty(hook))
          config[hook] = path.join(__dirname, 'jest.hooks.ts')
      }
    }
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