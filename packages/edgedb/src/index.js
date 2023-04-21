import * as edgedb from 'edgedb';

import config from 'config.js';

/**
 * Queries database, accepts a template string or JSON to format.
 *
 * @example
 * const client = client();
 * const query = `select "Hello world!";`;
 * async function run(){
*   const result = await client.query(query)
*   console.log(result); // "Hello world!"
* }
 */
export const client = edgedb.createClient({
  EDGEDB_DSN: config.EDGEDB_DSN,
});