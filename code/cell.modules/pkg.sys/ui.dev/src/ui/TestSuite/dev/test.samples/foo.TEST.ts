import { expect } from 'chai';
import { Test } from '../..';

export default Test.describe('Foo', (e) => {
  e.it('foo does something', () => {
    console.log('Foo');
    expect(123).to.eql(1234);
  });

  e.describe('child suite', (e) => {
    e.it('add something up', () => {
      const res = [1, 2, 3].reduce((acc, next) => acc + next, 0);
      expect(res).to.eql(6);
    });

    e.it.skip('this is skipped', () => {
      expect(123).to.eql(123);
      console.log('SKIPPED');
    });
  });
});
