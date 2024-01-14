/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { withPostgres } from '@/db/postgres';
import { getDeckStatistics } from '@/db/queries';
import {
  FormatTypeValidator,
  DateValidator,
  NumberValidator,
  StringValidator
} from '@/db/validators';
import { Execute } from '@/db/helpers';
import { Required, Optional, withValidation } from '@/validation';


const router = Router({ base: '/archetypes' })
  .get('/:format?',
    withValidation({
      // Parameters
      format:     Required(FormatTypeValidator),
      // Query args
      min_date:   Optional(DateValidator),
      max_date:   Optional(DateValidator),
      limit:      Optional(NumberValidator),
      archetype:  Optional(StringValidator),
    }),
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

export default router;
