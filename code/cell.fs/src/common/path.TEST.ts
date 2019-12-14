import { expect } from '../test';
import { path } from '.';

describe('path', () => {
  it('throw on invalid URI', () => {
    const test = (uri: any) => {
      const fn = () => path.resolve({ uri, root: '/tmp' });
      expect(fn).to.throw(/Invalid URI/);
    };

    test(undefined);
    test('');
    test('  ');
    test('ns:foo');
    test('cell:foo!A1');
    test('file:boom');
  });

  it('throw if not root path provided', () => {
    const test = (root: any) => {
      const fn = () => path.resolve({ uri: 'file:foo:123', root });
      expect(fn).to.throw(/Invalid root path/);
    };
    test(undefined);
    test('');
    test('  ');
  });

  it('resolve URI as path', () => {
    const test = (uri: string, root: string, expected: string) => {
      const res = path.resolve({ uri, root });
      expect(res).to.eql(`${root}/${expected}`);
    };
    test('file:foo:123', '/tmp', 'ns.foo/123');
    test('file:foo:123', 'tmp', 'ns.foo/123');
    test('file:ck3jldh1z00043fetc11ockko:1z53tcj', '/tmp', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
  });
});
