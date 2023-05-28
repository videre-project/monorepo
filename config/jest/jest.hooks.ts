/* @file
 * Jest hooks runner for Jest `globalSetup` and `globalTeardown` hooks.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { join } from 'path';

import { deepAssign } from '@videre/js';
import { Filters, evaluateFn, crawler } from '@videre/nodejs';

import type { Config } from '@jest/types';


declare global { var HAS_JEST_ENV: boolean; }

export function hasJestEnvironment() { 
  globalThis.HAS_JEST_ENV = globalThis.hasOwnProperty('HAS_JEST_ENV');
  if (!globalThis.HAS_JEST_ENV) {
    try {
      require('ts-node/register');
    } catch (e) {}
  }
  return globalThis.HAS_JEST_ENV;
};


export default async (globalConfig: Config.GlobalConfig, projectConfig: Config.ProjectConfig) => {
  const rootDir = globalConfig.rootDir;
  
  const jestConfig = await import(join(rootDir, 'jest.config.cjs'))
  const hook = !hasJestEnvironment() ? 'globalSetup' : 'globalTeardown';
  const type = hook.replace(/global/,'').toLowerCase();

  const filters: Filters = deepAssign({
    include: [ `/\\.${type}\\.(js|ts)$/` ],
    exclude: deepAssign([],
      // Inherit Jest ignore patterns
      Object.entries(projectConfig)
        .filter(([k,]) => /[i|I]+gnorePatterns$/i.test(k))
        .flatMap(([,v]) => v)
    )
  }, jestConfig.options.hooks[hook]);

  await crawler(rootDir, filters,
    // Import and evaluate the named hook or default export from filtered files.
    async (filename: string) => {
      const module = await import(filename);
      const fn: Function | undefined = module?.[type] || module?.default;
      if (fn !== undefined) await evaluateFn(fn, globalConfig, projectConfig);
  });
};
