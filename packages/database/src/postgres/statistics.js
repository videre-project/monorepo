import { sql } from '.';

/**
 * Gets current database connections' activity.
 */
export const get_stat_activity = async () => {
  return await sql`TABLE pg_stat_activity`
    .then(res =>
      res.map(obj => ({
        state: obj.state || 'inactive',
        name: obj.usename,
        application: obj.application_name,
        address: obj.client_addr
          ? `${obj.client_addr}:${obj.client_port}`
          : '<private>',
      })).filter(obj =>
        obj.address !== 'null:null'
        && obj.name !== null
        && obj.application.length
      )
    );
}

/**
 * Returns statistics related to database transactions and health.
 */
export const get_db_stats = async () => {
  return await sql`TABLE pg_stat_database`
    .then(res =>
      res
        .filter(obj => obj.datname == 'postgres')
        .map(obj => ({
          oid: obj.datid,
          service: obj.datname,
          backends: obj.numbackends,
          commits: obj.xact_commit,
          rollbacks: obj.xact_rollback,
          returned: obj.tup_returned,
          fetched: obj.tup_fetched,
          inserted: obj.tup_inserted,
          updated: obj.tup_updated,
          deleted: obj.tup_deleted,
          // temp: `${formatBytes(obj.temp_bytes)} (${obj.temp_files} ${obj.temp_files == 1 ? 'file' : 'files'})`,
          // deadlocks: obj.deadlocks || 0,
          // checksum_failures: obj.checksum_failures,
          // checksum_last_failure: obj.checksum_last_failure,
          // stats_reset: obj.stats_reset
        }))
    );
}