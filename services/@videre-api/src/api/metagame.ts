/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Router } from 'itty-router';

import { withPostgres } from '@/db/postgres';
import { getPresence, getWinrates } from '@/db/queries';
import {
  FormatTypeValidator,
  DateValidator,
  NumberValidator
} from '@/db/validators';
import { Required, Optional, withValidation } from '@/validation';


const router = Router({ base: '/api/metagame' })
  .get('/:format?',
    withValidation({
      // Parameters
      format:     Required(FormatTypeValidator),
      // Query args
      min_date:   Optional(DateValidator),
      max_date:   Optional(DateValidator),
      limit:      Optional(NumberValidator),
    }),
    withPostgres,
    async ({ proxy }, { sql }) => {
      const presence = getPresence(sql, proxy);
      const winrates = getWinrates(sql, proxy);

      const res = await sql`
        WITH
          presence AS (${presence}),
          winrates AS (${winrates})
        SELECT *
        FROM presence p
        INNER JOIN winrates w ON
          w.archetype = p.archetype
        ORDER BY
          p.count DESC,
          w.match_count DESC,
          w.match_winrate DESC,
          w.game_count DESC,
          w.game_winrate DESC
        LIMIT ${proxy.limit}
      `;

      return res;
    }
  );

export default router;
