import { expect } from 'chai';
import { match, IMatchOptions } from '.';

describe('match', () => {
  it('path', () => {
    const test = (pattern: string, value: string, isMatch: boolean, options?: IMatchOptions) => {
      const res = match(pattern).path(value, options);
      expect(res).to.eql(isMatch);
    };

    test('*.js', 'foo.js', true);
    test('*.js', 'boo/foo.js', false); // Path only
    test('**/*.js', 'foo.js', true);
    test('*/*.js', 'boo/foo.js', true);
    test('*/*.js', 'boom/boo/foo.js', false);
    test('**/*.js', 'boom/boo/foo.js', true);
  });

  it('base', () => {
    const test = (pattern: string, value: string, isMatch: boolean, options?: IMatchOptions) => {
      const res = match(pattern).base(value, options);
      expect(res).to.eql(isMatch);
    };
    test('*.js', 'foo.js', true);
    test('*.js', 'boo/foo.js', true);
    test('*.js', 'foo.png', false);
  });
});
