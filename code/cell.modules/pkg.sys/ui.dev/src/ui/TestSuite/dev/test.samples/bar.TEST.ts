import { expect } from 'chai';
import { Test } from '../..';

export default Test.describe('Bar', async (e) => {
  e.it('does something', async () => {
    console.log('Bar');
    expect(123).to.eql(123);
  });
});
