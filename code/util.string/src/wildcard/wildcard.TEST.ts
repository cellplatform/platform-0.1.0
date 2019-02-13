import { expect } from 'chai';
import * as str from '.';

describe('wildcard', () => {
  it('isWildcardMatch', () => {
    expect(str.isWildcardMatch('bath', 'ba*')).to.eql(true);
  });

  it('matches multiple values', () => {
    const result = str.matchesWildcard(['bath', 'batty', 'zoo'], ['ba*']);
    expect(result).to.eql(['bath', 'batty']);
  });
});
