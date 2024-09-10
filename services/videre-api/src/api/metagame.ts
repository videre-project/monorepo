/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { withPostgres } from '@/db/postgres';
import { getMetagame } from '@/db/queries';
import { FormatTypeValidator } from '@/db/validators';
import { Execute } from '@/db/helpers';
import { All, Required, withValidation } from '@/validation';

import { args as eventArgs } from './events';


export const args = All(eventArgs, {
  // Parameters
  format:     Required(FormatTypeValidator),
});

export default Router({ base: '/metagame' })
  .get('/:format?',
    withValidation(args),
    withPostgres,
    async (req, { sql, params }) => {
      let query = getMetagame(sql, params);

      return await Execute(sql`
        SELECT * FROM (${query})
        LIMIT ${params.limit}
      `, params);
    }
  );
