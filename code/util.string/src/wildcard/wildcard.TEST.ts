import { expect } from 'chai';
import { curry } from 'ramda';
import { str } from '..';

describe('wildcard', () => {
  it('isWildcardMatch', () => {
    expect(str.wildcard.isMatch('bath', 'ba*')).to.eql(true);
  });

  it('filters multiple values (single pattern)', () => {
    const res = str.wildcard.filter('ba*', ['bath', 'batty', 'zoo']);
    expect(res).to.eql(['bath', 'batty']);
  });

  it('filters multiple values', () => {
    const res = str.wildcard.filter(['ba*', 'z*'], ['bath', 'batty', 'zoo', 'camel']);
    expect(res).to.eql(['bath', 'batty', 'zoo']);
  });

  it('currys the match filter', () => {
    const filter = curry(str.wildcard.filter);
    const ba = filter('ba*');
    const res = ba(['bath', 'batty', 'zoo']);
    expect(res).to.eql(['bath', 'batty']);
  });
});
