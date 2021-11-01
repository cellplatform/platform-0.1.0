import { expect } from 'chai';
import { Test } from 'sys.ui.dev';
import { FsIndexedDb } from '..';

export default Test.describe.only('FsIndexer', (e) => {
  const testCreate = async () => {
    const name = 'test.foo';
    const fs = await FsIndexedDb({ name });

    return { fs, name };
  };

  e.it.only('dir', async () => {
    const { fs } = await testCreate();
    expect(fs.index.dir).to.eql('/');
    fs.dispose();
  });
});
