/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { useCache } from '@/cache';
import { withParams } from '@/parameters';
import { Error } from '@/responses';

import archetypes from './archetypes';
import events from './events';
import matchups from './matchups';
import metagame from './metagame';


export default Router()
  // Add middleware for caching
  .get('*', useCache)
  // Add middleware for mapping request parameters
  .all('*', withParams)
  // Add API routes
  .all('/archetypes/*', archetypes.handle)
  .all('/events/*', events.handle)
  .all('/matchups/*', matchups.handle)
  .all('/metagame/*', metagame.handle)
  // Catch-all for any other requests
  .all('*', () => Error(404, 'Could not find the requested resource.'));
