/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { withPostgres } from '@/db/postgres';
import { getEvents } from '@/db/queries';
import {
  FormatTypeValidator,
  DateValidator,
  NumberValidator
} from '@/db/validators';
import { Optional, withValidation } from '@/validation';


const router = Router({ base: '/api/events' })
  .get('/:format?',
    withValidation({
      // Parameters
      format:     Optional(FormatTypeValidator),
      // Query args
      min_date:   Optional(DateValidator),
      max_date:   Optional(DateValidator),
      limit:      Optional(NumberValidator),
    }),
    withPostgres,
    async (req, { sql, params }) => {
      const res = getEvents(sql, params);

      return await sql`
        SELECT * FROM (${res})
        LIMIT ${params.limit}
      `;
    }
  );

export default router;
