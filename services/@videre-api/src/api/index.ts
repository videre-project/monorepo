/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { withParams } from '@/parameters';
import { Format, withValidation } from '@/validation';

import matchups from './matchups';
import metagame from './metagame';


const router = Router({ base: '/api' })
  // Add validation middleware for common query params
  .all('*', withParams)
  .all('*', withValidation({
    format: Format
  }))
  // Add API routes
  .all('/matchups/*', matchups.handle)
  .all('/metagame/*', metagame.handle);

export default router;
