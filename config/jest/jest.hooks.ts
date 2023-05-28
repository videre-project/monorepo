/* @file
 * Jest hooks runner for Jest `globalSetup` and `globalTeardown` hooks.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { join } from 'path';

import { deepAssign } from '@videre/js';
import { Filters, mergeFileExtensions, evaluateFn, crawler } from '@videre/nodejs';

import type { Config } from '@jest/types';

import hasJestEnvironment from './lib/jest-environment';


export interface Hooks { globalSetup?: Filters, globalTeardown?: Filters };


export default async (globalConfig: Config.GlobalConfig, projectConfig: Config.ProjectConfig) => {
  const rootDir = globalConfig.rootDir;
  
  const jestConfig = await import(join(rootDir, 'jest.config.cjs'))
  const hooks: Hooks = jestConfig.options.hooks;
  const ts_jest = jestConfig.plugins.ts_jest;

  const name = !hasJestEnvironment() ? 'globalSetup' : 'globalTeardown';
  const type = name.replace(/global/,'').toLowerCase();
  const filters: Filters = deepAssign({
    include: [
      // Match any scripts containing the hook `name` or `type`.
      // e.g. `/\.(globalSetup|setup)\.(js|ts)$/`
      //      => `jest.globalSetup.ts`
      //  or  => `my-module.setup.ts`
      `\\.(${name}|${type})\\.(${mergeFileExtensions(
        /**
         * Inherit extensions supported by `ts-jest`
         * @see https://github.com/kulshekhar/ts-jest/blob/main/src/constants.ts
         */
        ts_jest.JS_JSX_EXTENSIONS,
        ts_jest.TS_TSX_REGEX,
        ts_jest.JS_JSX_REGEX,
        ts_jest.TS_EXT_TO_TREAT_AS_ESM,
        ts_jest.JS_EXT_TO_TREAT_AS_ESM,
        /**
         * Extensions supported by `import()`
         */
        ['cjs', 'mjs'],
      )})$`
    ],
    exclude: deepAssign([],
      /**
       * Inherit Jest ignore patterns
       */
      Array.from(Object.entries(projectConfig)
        .filter(([k,]) => /[i|I]+gnorePatterns$/i.test(k))
        .flatMap(([,v]) => v as string | string[])
        .reduce((acc: Set<string>, s: string) =>
          acc.has(s) ? acc : acc.add(s), new Set()) as Set<string>),
    )
  }, hooks[name]);

  await crawler(rootDir, filters,
    // Import and evaluate the named hook or default export from filtered files.
    async (filename: string) => {
      const module = await import(filename);
      const fn: Function | undefined =
        module?.[name] || module?.[type] || module?.default;
      if (fn !== undefined) await evaluateFn(fn, globalConfig, projectConfig);
  });
};
