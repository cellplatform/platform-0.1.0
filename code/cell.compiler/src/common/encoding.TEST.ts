import { expect } from '../test';
import { encoding } from './encoding';

type O = Record<string, any>;

describe.only('encoding', () => {
  it('escapePath | unescapePath', () => {
    const test = (input: string, expected: string) => {
      const escaped = encoding.escapePath(input);
      expect(escaped).to.eql(expected);
      expect(encoding.unescapePath(escaped)).to.eql(input);
    };
    test('', '');
    test('foo', 'foo');
    test('foo/bar', 'foo\\bar');
  });

  it('escapeKeyPaths | unescapeKeyPaths', () => {
    const test = (input: O, expected: O) => {
      const escaped = encoding.escapeKeyPaths(input);
      expect(escaped).to.eql(expected);
      expect(encoding.unescapeKeyPaths(escaped)).to.eql(input);
    };
    test({}, {});
    test({ foo: 123 }, { foo: 123 });
    test({ 'foo/bar': 123 }, { 'foo\\bar': 123 });
  });
});
