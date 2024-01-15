/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { Error } from '@/responses';


export default Router()
  // Catch-all for any other requests
  .all('*', () => Error(404, 'Could not find the requested resource.'));
