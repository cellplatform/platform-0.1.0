import { expect } from '../test';
import { Patch } from '.';

describe('Patch', () => {
  it('apply', () => {
    const fn = () => Patch.apply({ foo: 123 }, []);
    expect(fn).to.throw();
  });
});
