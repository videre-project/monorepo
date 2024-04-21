/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router, cors } from 'itty-router';

import { useCache } from '@/cache';
import { withParams } from '@/parameters';
import { Error, asJSON } from '@/responses';

import archetypes from './archetypes';
import events from './events';
import matchups from './matchups';
import metagame from './metagame';


const { preflight, corsify } = cors();

export default Router({ before: [preflight], finally: [asJSON, corsify] })
  // Add middleware for caching
  .get('*', useCache)
  // Add middleware for mapping request parameters
  .all('*', withParams)
  // Add API routes
  .all('/archetypes/*', archetypes.fetch)
  .all('/events/*', events.fetch)
  .all('/matchups/*', matchups.fetch)
  .all('/metagame/*', metagame.fetch)
  // Catch-all for any other requests
  .all('*', () => Error(404, 'Could not find the requested resource.'));
