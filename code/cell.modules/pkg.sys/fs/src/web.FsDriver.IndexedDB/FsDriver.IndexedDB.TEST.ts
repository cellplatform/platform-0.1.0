import { expect } from 'chai';
import { Test } from 'sys.ui.dev';
import { FsDriverIndexedDB } from '.';
import { slug } from './common';
import { IndexedDb } from './IndexedDb';

export default Test.describe('FsDriver.IndexedDb', (e) => {
  e.it('create', async (e) => {
    const name = `test.${slug()}`;
    const db = await FsDriverIndexedDB({ name, dir: 'foo' });

    expect(db.name).to.eql(name);
    expect(db.version).to.eql(1);

    await IndexedDb.delete(name);
  });
});
