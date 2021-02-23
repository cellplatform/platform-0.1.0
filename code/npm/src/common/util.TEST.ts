import { expect } from '../test';
import { parseVersionPrefix } from './util';

describe('util', () => {
  it('parseVersionPrefix', () => {
    const test = (input: string, prefix: string, version: string) => {
      const res = parseVersionPrefix(input);
      expect(res.prefix).to.eql(prefix);
      expect(res.version).to.eql(version);
    };

    test('~1.0.0', '~', '1.0.0');
    test('  ~1.0.0  ', '~', '1.0.0');
    test('^1.0.0', '^', '1.0.0');
    test('  1.0.0  ', '', '1.0.0');

    test('foo1.0.0', '', 'foo1.0.0');
    test('~1.0.0-beta.1', '~', '1.0.0-beta.1');
  });
});
