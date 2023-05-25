/* @file
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { deepAssign } = require('../../scripts/lib/json-utils.cjs');


function baseConfig(filepath, { tsconfig, ts_jest }) {
  const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePathIgnorePatterns: ['<rootDir>/build/'],
    modulePaths: ['<rootDir>']
  }

  // Merge properties from tsconfig `extends` filepath.
  if (tsconfig.extends) {
    const baseDir = require('path').dirname(filepath);
    tsconfig = deepAssign(tsconfig, require(`${baseDir}/${tsconfig.extends}`));
  }

  // Add `moduleNameMapper` properties from `paths` in tsconfig.
  if (tsconfig.compilerOptions?.paths && ts_jest.pathsToModuleNameMapper) {
    config['moduleNameMapper'] = ts_jest.pathsToModuleNameMapper(
      tsconfig.compilerOptions.paths,
      { prefix: '<rootDir>' }
    );
  }

  return config;
}

module.exports = baseConfig;