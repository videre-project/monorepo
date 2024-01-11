/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error, Router } from 'itty-router';

import { withPostgres } from '@/db/postgres';
import { getMatchupMatrix } from '@/db/queries';
import {
  FormatTypeValidator,
  DateValidator,
  NumberValidator,
  StringValidator
} from '@/db/validators';
import { Required, Optional, withValidation } from '@/validation';


const router = Router({ base: '/api/matchups' })
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
    async ({ proxy, archetype }, { sql }) => {
      const res = getMatchupMatrix(sql, proxy);

      if (archetype) {
        const subquery = await sql`
          SELECT * FROM (${res})
          WHERE archetype = ${archetype}
        `;
        if (!subquery.length)
          return error(400, `No results found for archetype '${archetype}'`);

        return subquery;
      }

      return await sql`SELECT * FROM (${res}) LIMIT ${proxy.limit}`;
    }
  );

export default router;
