console.log('tmp', 123);
import { Test } from '../src/api/TestSuite';
import { expect } from 'chai';

const root = Test.describe('root', (e) => {
  e.it('hello', async () => {
    expect(123).to.eql(123);
  });
});

(async () => {
  const res = await root.run();

  console.log('res', res);
})();
