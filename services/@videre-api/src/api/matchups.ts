/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { error, Router } from 'itty-router';

import { withPostgres } from '@/db/postgres';
import { getMatchupMatrix } from '@/db/queries';
import { useParams } from '@/parameters';


const router = Router({ base: '/api/matchups' })
  .all('*', useParams([
    'format',
    'archetype',
    'min_date',
    'max_date',
    'limit'
  ]))
  .get('/', () => error(400, 'No format specified'))
  .get('/:format', withPostgres,
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
