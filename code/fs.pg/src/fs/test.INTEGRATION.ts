import { pg } from '..';
import { fs } from '../common';
import { FileDb } from '@platform/fs.db';

import test, { expect } from '../test';
const dir = 'tmp/export';

const dropTables = async () => {
  const tables = ['FOO', 'BAR', 'BOO'];
  await test.dropTables(tables);
};

describe.only('fs (integration)', () => {
  let db: pg.PgDoc = test.db();
  beforeEach(async () => {
    await fs.remove(fs.resolve(dir));
    await dropTables();
    db = test.db();
  });
  afterEach(() => db.dispose());

  describe('export', () => {
    const fsdb = FileDb.create({ dir });

    it('exports to dir', async () => {
      expect((await fsdb.find('FOO')).keys).to.eql([]);

      // Setup a postgres DB with sample data.
      await db.putMany([
        { key: 'FOO/1', value: { msg: 'hello' } },
        { key: 'FOO/2', value: 123 },
        { key: 'FOO/bar/baz/info', value: { count: 456 } },
      ]);

      const query = 'FOO';
      const res1 = await db.find(query);
      expect(res1.keys.length).to.eql(3);

      // Run the export.
      await pg.fs.export({ db, dir, query });

      // Read in the exported file content into a file-system DB.
      const res2 = await fsdb.find(query);
      expect(res1.map).to.eql(res2.map);
    });
  });
});
