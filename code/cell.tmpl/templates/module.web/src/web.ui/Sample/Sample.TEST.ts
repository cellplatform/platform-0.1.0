import { expect, Test } from '../../web.test';

export default Test.describe('Tests', (e) => {
  e.it('tmp', async () => {
    expect(123).to.eql(123);
  });
});
