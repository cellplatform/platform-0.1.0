import { expect } from '../test';
import { path } from '.';

import { fs } from '@platform/fs';

describe('path', () => {
  it('throw on invalid URI', () => {
    const test = (uri: any) => {
      const fn = () => path.resolveUri({ uri, dir: '/tmp' });
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
    const test = (dir: any) => {
      const fn = () => path.resolveUri({ uri: 'file:foo:123', dir });
      expect(fn).to.throw(/Invalid root directory path/);
    };
    test(undefined);
    test('');
    test('  ');
  });

  it('resolve URI as path', () => {
    const test = (uri: string, dir: string, expected: string) => {
      const res = path.resolveUri({ uri, dir });
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
    test(['foo/bar'], 'foo/bar');
    test(['foo/bar', 'baz'], 'foo/bar/baz');
    test(['foo/bar/', 'baz/', '/boo/'], 'foo/bar/baz/boo/');

    test(['foo/./bar', 'baz/'], 'foo/bar/baz/');

    test(['foo/./bar'], 'foo/bar');
    test(['foo/../bar'], 'bar');
    test(['foo/../../bar'], '');
    test(['foo/../../.././../bar'], '');
    test(['.'], '');
    test(['..'], '');
    test(['../../.././../bar'], '');
    test(['foo/bar/baz', '../.././zoo'], 'foo/zoo');
  });
});
