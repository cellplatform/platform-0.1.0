import { expect } from '../test';
import { path } from '.';

describe('path', () => {
  it('throw on invalid URI', () => {
    const test = (uri: any) => {
      const fn = () => path.resolve({ uri, dir: '/tmp' });
      expect(fn).to.throw(/Invalid URI/);
    };

    test(undefined);
    test('');
    test('  ');
    test('ns:foo');
    test('cell:foo!A1'); // NB: "!" not correct format within a URI.
    test('file:boom');
  });

  it('throw if not root path provided', () => {
    const test = (root: any) => {
      const fn = () => path.resolve({ uri: 'file:foo:123', dir: root });
      expect(fn).to.throw(/Invalid root path/);
    };
    test(undefined);
    test('');
    test('  ');
  });

  it('resolve URI as path', () => {
    const test = (uri: string, dir: string, expected: string) => {
      const res = path.resolve({ uri, dir });
      expect(res).to.eql(`${dir}/${expected}`);
    };
    test('file:foo:123', '/tmp', 'ns.foo/123');
    test('file:foo:123', 'tmp', 'ns.foo/123');
    test('file:ck3jldh1z00043fetc11ockko:1z53tcj', '/tmp', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
  });

  it('join', () => {
    const test = (parts: string[], expected: string) => {
      const res = path.join(...parts);
      expect(res).to.eql(expected);
    };
    test([], '');
    test(['foo'], 'foo');
    test(['/foo'], '/foo');
    test(['foo/'], 'foo/');
    test(['/foo/'], '/foo/');
    test(['foo/', '/bar'], 'foo/bar');
    test(['foo///', '///bar'], 'foo/bar');
    test(['/foo///', '///bar/'], '/foo/bar/');
  });
});
