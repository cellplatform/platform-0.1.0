import { expect } from '../test';
import { Path } from '.';

describe('Path', () => {
  describe('resolveUri', () => {
    it('throw on invalid URI', () => {
      const test = (uri: any) => {
        const fn = () => Path.resolveUri({ uri, dir: '/tmp' });
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
        const fn = () => Path.resolveUri({ uri: 'file:foo:123', dir });
        expect(fn).to.throw(/Invalid root directory path/);
      };
      test(undefined);
      test('');
      test('  ');
    });

    it('resolve URI as path', () => {
      const test = (uri: string, dir: string, expected: string) => {
        const res = Path.resolveUri({ uri, dir });
        expect(res).to.eql(`${dir}/${expected}`);
      };
      test('file:foo:123', '/tmp', 'ns.foo/123');
      test('file:foo:123', 'tmp', 'ns.foo/123');
      test(
        'file:ck3jldh1z00043fetc11ockko:1z53tcj',
        '/tmp',
        'ns.ck3jldh1z00043fetc11ockko/1z53tcj',
      );
    });
  });

  it('join', () => {
    const test = (parts: string[], expected: string) => {
      const res = Path.join(...parts);
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

  describe('trim', () => {
    it('trimSlashes', () => {
      const test = (input: any, expected: string) => {
        expect(Path.trimSlashes(input)).to.eql(expected);
      };

      test('', '');
      test('  ', '');

      test('/', '');
      test('  /  ', '');
      test('/foo/', 'foo');
      test('  /  foo/bar  /  ', 'foo/bar');

      test(null, '');
      test(undefined, '');
      test(123, '');
      test([123], '');
      test({}, '');
    });

    it('trimSlashesStart', () => {
      const test = (input: any, expected: string) => {
        expect(Path.trimSlashesStart(input)).to.eql(expected);
      };

      test('/', '');
      test('  /  ', '');
      test('foo', 'foo');
      test('/foo', 'foo');
      test('/  foo', 'foo');
      test('  /  foo', 'foo');
      test('/foo/bar  ', 'foo/bar');
      test('/foo/bar/', 'foo/bar/');
      test('/foo/bar /', 'foo/bar /');
    });

    it('trimSlashesEnd', () => {
      const test = (input: any, expected: string) => {
        expect(Path.trimSlashesEnd(input)).to.eql(expected);
      };

      test('/', '');
      test('  /  ', '');
      test('foo', 'foo');
      test('/foo', '/foo');
      test('/foo/  ', '/foo');
      test('/foo  /  ', '/foo');
    });

    it('trimHttp', () => {
      const test = (input: any, expected: string) => {
        expect(Path.trimHttp(input)).to.eql(expected);
      };

      test('   ', '');
      test('foo', 'foo');
      test('  /foo/', '/foo/');

      test('http:/foo', 'http:/foo');
      test('https:/foo', 'https:/foo');
      test('http//foo', 'http//foo');

      test('  http://foo  ', 'foo');
      test('  https://foo/bar  ', 'foo/bar');

      test(null, '');
      test(undefined, '');
      test(123, '');
      test([123], '');
      test({}, '');
    });

    it.only('trimWildcardEnd', () => {
      const test = (input: any, expected: string) => {
        expect(Path.trimWildcardEnd(input)).to.eql(expected);
      };

      test('', '');
      test('  ', '');
      test('/', '/');
      test('  /  ', '/');

      test('/*', '/');
      test('/foo/*', '/foo/');
      test('/foo/**', '/foo/');
      test('/foo/**/*', '/foo/');
      test('/foo/**/**', '/foo/');

      test('*', '');
      test('*/*', '');
      test('**/*', '');

      test(null, '');
      test(undefined, '');
      test(123, '');
      test([123], '');
      test({}, '');
    });
  });
});