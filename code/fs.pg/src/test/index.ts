import { PgDoc } from '..';
import { pg, time } from '../common';

export { time };
export { expect, expectError } from '@platform/test';

export const params = {
  user: 'dev',
  host: 'localhost',
  database: 'test',
};

export const test = {
  db() {
    return PgDoc.create({ db: params });
  },

  async dropTables(tables: string[]) {
    const client = new pg.Pool(params);
    const drop = (table: string) => client.query(`DROP TABLE IF EXISTS "${table}"`);
    await Promise.all(tables.map(table => drop(table)));
    client.end();
  },
};

export default test;
