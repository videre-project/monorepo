/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error, Router } from 'itty-router';

import { withPostgres } from '@/db/postgres';
import { getPresence, getWinrates } from '@/db/queries';
import { useParams } from '@/parameters';


const router = Router({ base: '/api/metagame' })
  .all('*', useParams([
    'format',
    'min_date',
    'max_date',
    'limit'
  ]))
  .get('/', () => error(400, 'No format specified'))
  .get('/:format', withPostgres,
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
