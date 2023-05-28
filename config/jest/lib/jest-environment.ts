/* @file
 * Typescript function for checking if the Jest environment has been created.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/


declare global { var HAS_JEST_ENV: boolean; }

export default function hasJestEnvironment() { 
  globalThis.HAS_JEST_ENV = globalThis.hasOwnProperty('HAS_JEST_ENV');
  if (!globalThis.HAS_JEST_ENV) {
    try {
      require('ts-node/register');
    } catch (e) {}
  }
  return globalThis.HAS_JEST_ENV;
};
