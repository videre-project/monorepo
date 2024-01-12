/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { withParams } from '@/parameters';

import archetypes from './archetypes';
import events from './events';
import matchups from './matchups';
import metagame from './metagame';


const router = Router({ base: '/api' })
  // Add middleware for mapping request parameters
  .all('*', withParams)
  // Add API routes
  .all('/archetypes/*', archetypes.handle)
  .all('/events/*', events.handle)
  .all('/matchups/*', matchups.handle)
  .all('/metagame/*', metagame.handle);

export default router;
