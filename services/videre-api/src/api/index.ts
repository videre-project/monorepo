/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router, cors } from 'itty-router';

import { useCache } from '@/cache';
import { withParams } from '@/parameters';
import { Error, asJSON } from '@/responses';

import archetypes from './archetypes';
import cards from './cards';
import events from './events';
import matchups from './matchups';
import metagame from './metagame';
import mtgo from './mtgo';
import products from './products';
import sets from './sets';


const { preflight, corsify } = cors();

export default Router({ before: [preflight], finally: [asJSON, corsify] })
  .get('*', useCache)
  .all('*', withParams)
  .all('/archetypes', archetypes.fetch)
  .all('/archetypes/*', archetypes.fetch)
  .all('/cards', cards.fetch)
  .all('/cards/*', cards.fetch)
  .all('/events', events.fetch)
  .all('/events/*', events.fetch)
  .all('/matchups', matchups.fetch)
  .all('/matchups/*', matchups.fetch)
  .all('/metagame', metagame.fetch)
  .all('/metagame/*', metagame.fetch)
  .all('/mtgo', mtgo.fetch)
  .all('/mtgo/*', mtgo.fetch)
  .all('/products', products.fetch)
  .all('/products/*', products.fetch)
  .all('/sets', sets.fetch)
  .all('/sets/*', sets.fetch)
  .all('*', () => Error(404, 'Could not find the requested resource.'));
