import { expect } from 'chai';

describe('my-test', () => {
  it('succeeds', () => {
    const list = [1, 2, 3];

    const res = list.map((e) => e + 1);

    expect(res).to.eql([2, 3, 4]);
  });
});
