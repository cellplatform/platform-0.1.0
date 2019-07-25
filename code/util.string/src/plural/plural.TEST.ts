import { expect } from 'chai';
import { str } from '..';

describe('plural', () => {
  it('return raw values', () => {
    const res = str.plural('cat', 'cats');
    expect(res.singular).to.eql('cat');
    expect(res.plural).to.eql('cats');
  });

  it('plural conversion', () => {
    const word = str.plural('cat', 'cats');
    const test = (total: number, output: string) => {
      const res = word.toString(total);
      expect(res).to.eql(output);
    };
    test(0, 'cats');
    test(1, 'cat');
    test(-1, 'cat');
    test(2, 'cats');
    test(-2, 'cats');
    test(99, 'cats');
    test(-99, 'cats');
  });

  it('no total passed to toString', () => {
    const word = str.plural('cat', 'cats');
    expect(word.toString()).to.eql('cats');
  });
});
