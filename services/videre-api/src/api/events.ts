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
import { Optional, withValidation } from '@/validation';


export const args = {
  // Parameters
  format:     Optional(FormatTypeValidator),
  // Query args
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

      return await Execute(sql`
        SELECT * FROM (${query})
        LIMIT ${params.limit}
      `, params);
    }
  );
