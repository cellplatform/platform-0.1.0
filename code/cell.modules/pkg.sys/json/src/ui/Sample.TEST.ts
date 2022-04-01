import { Test, expect } from 'sys.ui.dev';

export default Test.describe('sample', (e) => {
  e.it('tmp', async () => {
    expect(123).to.eql(123);
  });
});
