/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { withPostgres } from '@/db/postgres';
import { getDeckStatistics } from '@/db/queries';
import { FormatTypeValidator, StringValidator } from '@/db/validators';
import { Execute } from '@/db/helpers';
import { All, Required, Optional, withValidation } from '@/validation';

import { args as eventArgs } from './events';


export const args = All(eventArgs, {
  // Parameters
  format:     Required(FormatTypeValidator),
  // Query args
  archetype:  Optional(StringValidator),
});

export default Router({ base: '/archetypes' })
  .get('/:format?',
    withValidation(args),
    withPostgres,
    async ({ archetype }, { sql, params }) => {
      let query = getDeckStatistics(sql, params);
      if (archetype) {
        params.limit = 1;
        query = sql`
          SELECT * FROM (${query})
          WHERE archetype = ${archetype}
        `;
      }

      return await Execute(sql`
        SELECT * FROM (${query})
        LIMIT ${params.limit}
      `, params);
    }
  );
