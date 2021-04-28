import { expect } from '../test';
import { BundleCache } from '.';

describe('BundleCache', () => {
  describe('BundleCache.url', () => {
    it('parses', () => {
      const href = 'http://localhost:1234/cell:foo:A1?foo';
      const url = BundleCache.url(href);
      expect(url.toString()).to.eql(href);
      expect(url.protocol).to.eql('http');
      expect(url.host).to.eql('localhost:1234');
      expect(url.hostname).to.eql('localhost');
      expect(url.port).to.eql(1234);
      expect(url.query()).to.eql({ foo: true });
    });

    it('uri', () => {
      const test = (href: string, expected: string) => {
        const url = BundleCache.url(href);
        expect(url.uri).to.eql(expected);
      };

      test('http://localhost:1234/cell:foo:A1', 'cell:foo:A1');
      test('http://localhost:1234/cell:foo:A1/foobar', 'cell:foo:A1');
      test('http://localhost:1234/ns:foo', 'ns:foo');
      test('http://localhost:1234/file:foo:123', 'file:foo:123');
      test('http://localhost:1234/yo:mama', 'yo:mama');
      test('http://localhost:1234/yo:mama/foo:bar', 'yo:mama');

      test('http://localhost:1234', '');
      test('http://localhost:1234/', '');
      test('http://localhost:1234/foo/bar', '');
    });

    it('isFilesystem', () => {
      const test = (href: string, expected: boolean) => {
        const url = BundleCache.url(href);
        expect(url.isFilesystem).to.eql(expected);
      };

      test('http://localhost:1234/cell:foo:A1/fs', true);
      test('http://localhost:1234/cell:foo:A1/fs/', true);
      test('http://localhost:1234/cell:foo:A1/fs/foo/bar.md', true);

      test('http://localhost:1234/cell:foo:A1', false);
      test('http://localhost:1234/cell:foo:A1/', false);
      test('http://localhost:1234', false);
      test('http://localhost:1234/fs', false);
      test('http://localhost:1234/fs/file.foo', false);
    });
  });
});
