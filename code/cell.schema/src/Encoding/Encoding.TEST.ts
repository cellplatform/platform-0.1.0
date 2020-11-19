import { expect } from '../test';
import { Encoding } from '.';

type O = Record<string, any>;

describe('encoding', () => {
  it('escapePath | unescapePath', () => {
    const test = (input: string, expected: string) => {
      const escaped = Encoding.escapePath(input);
      expect(escaped).to.eql(expected);
      expect(Encoding.unescapePath(escaped)).to.eql(input);
    };
    test('', '');
    test('foo', 'foo');
    test('foo/bar', 'foo\\bar');
  });

  it('transformKeys', () => {
    const test = (input: O, fn: (input: string) => string, expected: O) => {
      const escaped = Encoding.transformKeys(input, fn);
      expect(escaped).to.eql(expected);
    };

    test({}, Encoding.escapePath, {});
    test({ foo: 123 }, Encoding.escapePath, { foo: 123 });
    test({ 'foo/bar': 123 }, Encoding.escapePath, { 'foo\\bar': 123 });
  });

  it('transformValues', () => {
    const test = (input: O, fn: (input: string) => string, expected: O) => {
      const escaped = Encoding.transformValues(input, fn);
      expect(escaped).to.eql(expected);
    };

    test({}, Encoding.escapePath, {});
    test({ foo: 'foo/bar' }, Encoding.escapePath, { foo: 'foo\\bar' });
  });

  it('escapeScope | unescapeScope', () => {
    const test = (input: string, expected: string) => {
      const escaped = Encoding.escapeNamespace(input);
      expect(escaped).to.eql(expected);
      expect(Encoding.unescapeNamespace(escaped)).to.eql(input);
    };
    test('', '');
    test('foo', 'foo');
    test('foo.bar', 'foo__bar');
    test('.foo', '__foo');
  });
});
