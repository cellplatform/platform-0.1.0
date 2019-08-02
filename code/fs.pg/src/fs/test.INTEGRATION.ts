import { FileDb } from '@platform/fsdb.file';

import { pg } from '..';
import { fs } from '../common';
import test, { expect } from '../test';

const dir = 'tmp/export';

const dropTables = async () => {
  const tables = ['FOO', 'SHEET'];
  await test.dropTables(tables);
};

describe('fs (integration)', () => {
  let db: pg.PgDoc = test.db();
  const fsdb = FileDb.create({ dir });

  beforeEach(async () => {
    await fs.remove(fs.resolve(dir));
    await dropTables();
    db = test.db();
  });
  afterEach(() => db.dispose());

  it('export', async () => {
    expect((await fsdb.find('FOO/**')).keys).to.eql([]);

    // Setup a postgres DB with sample data.
    await db.putMany([
      { key: 'FOO/1', value: { msg: 'hello' } },
      { key: 'FOO/2', value: 123 },
      { key: 'FOO/bar/baz/info', value: { count: 456 } },
    ]);

    const query = 'FOO/**';
    const res1 = await db.find(query);
    expect(res1.keys.length).to.eql(3);

    // Run the export.
    const res2 = await pg.fs.export({ db, dir, query });
    expect(res2.total).to.eql(3);

    // Read in the exported file content into a file-system DB.
    const res3 = await fsdb.find(query);
    expect(res1.map).to.eql(res3.map);
  });

  it('import (from file-system)', async () => {
    // Export sample data to the file-system.
    await fsdb.putMany([
      { key: 'SHEET/cell/A1', value: { msg: 'hello' } },
      { key: 'SHEET/cell/A2', value: 123 },
      { key: 'SHEET/cell/A2/info', value: { count: 888 } },
    ]);

    // Confirm the postgres DB is empty.
    const query = 'SHEET/**';
    const res1 = await db.find(query);
    expect(res1.length).to.eql(0);

    // Run the file-system importer.
    const res2 = await pg.fs.import({ db, dir });
    expect(res2.count).to.eql(3);

    // Ensure values exist in postgres DB.
    const res3 = await db.find(query);
    expect(res3.length).to.eql(3);
    expect(res3.map['SHEET/cell/A1']).to.eql({ msg: 'hello' });
    expect(res3.map['SHEET/cell/A2']).to.eql(123);
    expect(res3.map['SHEET/cell/A2/info']).to.eql({ count: 888 });
  });
});
