import { expect } from 'chai';
import { Test } from 'sys.ui.dev';
import { FsDriverLocal } from '..';

export default Test.describe('FsIndexer', (e) => {
  const testCreate = async () => {
    const name = 'test.foo';
    const fs = await FsDriverLocal({ name });

    return { fs, name };
  };

  e.it('dir', async () => {
    const { fs } = await testCreate();
    expect(fs.index.dir).to.eql('/');
    fs.dispose();
  });
});
