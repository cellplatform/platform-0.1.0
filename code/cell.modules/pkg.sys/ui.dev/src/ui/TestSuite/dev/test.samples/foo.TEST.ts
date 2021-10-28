import { expect } from 'chai';
import { Test } from '../..';

export default Test.describe('Foo', (e) => {
  e.it('foo does something', () => {
    console.log('Foo');
    expect(123).to.eql(1234);
  });
});
