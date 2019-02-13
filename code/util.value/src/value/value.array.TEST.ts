import { expect } from 'chai';
import { value } from '.';

describe('compact', () => {
  it('makes no change', () => {
    expect(value.compact([1, 2, 3])).to.eql([1, 2, 3]);
  });

  it('removes null values', () => {
    expect(value.compact([1, null, 3, null])).to.eql([1, 3]);
  });

  it('removes undefined values', () => {
    expect(value.compact([1, undefined, 3, undefined])).to.eql([1, 3]);
  });

  it('removes empty strings', () => {
    expect(value.compact([1, '', 3])).to.eql([1, 3]);
  });

  it('retains `false` and 0', () => {
    expect(value.compact([0, 1, false, 3])).to.eql([0, 1, false, 3]);
  });

  it('retains white space strings', () => {
    expect(value.compact([0, 1, ' ', 3])).to.eql([0, 1, ' ', 3]);
  });
});

describe('flatten', () => {
  it('makes no change', () => {
    expect(value.flatten([1, 2, 3])).to.eql([1, 2, 3]);
  });

  it('return input value if an array is not passed', () => {
    expect(value.flatten(123)).to.eql(123);
  });

  it('flattens one level deep', () => {
    expect(value.flatten([1, [2, 3]])).to.eql([1, 2, 3]);
  });

  it('flattens many levels deep', () => {
    expect(value.flatten([1, [2, [3, [4, [5, 6]]]]])).to.eql([
      1,
      2,
      3,
      4,
      5,
      6,
    ]);
  });
});
