import { sql } from '.';

const table_props = {
    'events': { uid_key: 'uid', distinct_keys: ['uri', 'format', 'type', 'date'] },
    'results': { uid_key: 'uid', distinct_keys: ['url', 'username', 'event'] }
};

export const delete_row_uids = async (table, uids) => {
    if (!Object.keys(table_props).includes(table)) return;
    if (!uids) return;
    for (let i = 0; i < Object.keys(table_props).length; i++) {
        if (table && table !== _table) continue;
        const _table = table_props[Object.keys(table_props)];
        const uid_key = table == 'results'
            ? 'uid'
            : (_table == 'events' ? 'uid' : 'event');
        return await sql.unsafe(
            `DELETE FROM ${_table} WHERE ${uid_key} IN (${uids.join(', ')})`
        );
    }
}

export const delete_row_duplicates = async (table, uids) => {
    if (!Object.keys(table_props).includes(table)) return;
    const { uid_key, distinct_keys } = table_props[table];
    if (uids) {
        return await sql.unsafe(
            `DELETE FROM ${table} WHERE ${uid_key} IN (${uids.join(', ')})`
        );
    } else {
        return await sql.unsafe(`
            DELETE FROM ${table}
            WHERE ${uid_key} IN (
                SELECT ${uid_key}
                FROM (SELECT ${uid_key},
                    ROW_NUMBER()
                    OVER (partition BY ${distinct_keys.join(', ')}
                    ORDER BY ${uid_key}) AS rnum
                FROM ${table}) t
                WHERE t.rnum > 1);
        `);
    }
    
 }