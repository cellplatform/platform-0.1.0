import { expect } from 'chai';
import { Test } from '..';

export default Test.describe('Two', async (e) => {
  e.it('two.foo', () => {
    console.log('two.foo');
    expect(123).to.eql(123);
  });
});
