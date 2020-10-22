import { expect } from '../test';
import { encoding } from './encoding';

type O = Record<string, any>;

describe('encoding', () => {
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

  it('transformKeys', () => {
    const test = (input: O, fn: (input: string) => string, expected: O) => {
      const escaped = encoding.transformKeys(input, fn);
      expect(escaped).to.eql(expected);
    };

    test({}, encoding.escapePath, {});
    test({ foo: 123 }, encoding.escapePath, { foo: 123 });
    test({ 'foo/bar': 123 }, encoding.escapePath, { 'foo\\bar': 123 });
  });

  it('transformValues', () => {
    const test = (input: O, fn: (input: string) => string, expected: O) => {
      const escaped = encoding.transformValues(input, fn);
      expect(escaped).to.eql(expected);
    };

    test({}, encoding.escapePath, {});
    test({ foo: 'foo/bar' }, encoding.escapePath, { foo: 'foo\\bar' });
  });

  it('escapeScope | unescapeScope', () => {
    const test = (input: string, expected: string) => {
      const escaped = encoding.escapeScope(input);
      expect(escaped).to.eql(expected);
      expect(encoding.unescapeScope(escaped)).to.eql(input);
    };
    test('', '');
    test('foo', 'foo');
    test('foo.bar', 'foo__bar');
    test('.foo', '__foo');
  });
});
