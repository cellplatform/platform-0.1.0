import { expect } from 'chai';
import { Test } from '../..';

export default Test.describe('Bar', async (e) => {
  e.it('bar does something', async () => {
    expect(123).to.eql(123);
  });
});
