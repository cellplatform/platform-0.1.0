import { expect } from 'chai';
import { Test } from 'sys.ui.dev';
import { FsIndexedDb } from '.';
import { testCreate } from './FsDriver.TEST';

export default Test.describe.only('FsIndexer', (e) => {
  e.it('dir', async () => {
    const { index } = await testCreate();
    expect(index.dir).to.eql('/');
  });
});
