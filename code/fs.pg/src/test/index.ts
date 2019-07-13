import { PgDoc } from '..';
import { time } from '../common';
import { Pg } from '../PgDoc';

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
    const db = Pg.create({ db: params });
    await db.dropTable(...tables);
    db.dispose();
  },
};

export default test;
