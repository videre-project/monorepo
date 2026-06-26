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
import { Execute } from '@/db/helpers';
import { clampListLimit } from '@/queryPolicy';
import { Optional, withValidation } from '@/validation';


export const args = {
  format:     Optional(FormatTypeValidator),
  event_id:   Optional(NumberValidator),
  min_date:   Optional(DateValidator),
  max_date:   Optional(DateValidator),
  limit:      Optional(NumberValidator),
};

export default Router({ base: '/events' })
  .get('/:format?',
    withValidation(args),
    withPostgres,
    async (req, { sql, params }) => {
      let query = getEvents(sql, params);
      const limit = clampListLimit(params.limit);

      return await Execute(sql`
        SELECT * FROM (${query})
        LIMIT ${limit}
      `, params);
    }
  );
