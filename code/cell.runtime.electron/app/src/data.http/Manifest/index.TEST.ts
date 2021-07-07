import { ManifestSource, ManifestUrl } from '.';
import { expect, Uri } from '../../test';

describe('Manifest', () => {
  describe('ManifestSource', () => {
    it('kind: filepath', () => {
      const path = '/foo/bar/index.json';
      const source = ManifestSource(`  ${path}  `); // NB: trimmed.
      expect(source.kind).to.eql('filepath');
      expect(source.domain).to.eql('local:package');
      expect(source.dir).to.eql('/foo/bar');
      expect(source.path).to.eql(path);
      expect(source.toString()).to.eql(path);
    });

    it('kind: url', () => {
      const path = 'https://domain.com:1234/cell:foo:A1/fs/foo/bar/index.json';
      const source = ManifestSource(`  ${path}  `); // NB: trimmed.
      expect(source.kind).to.eql('url');
      expect(source.path).to.eql(path);
      expect(source.domain).to.eql('domain.com:1234');
      expect(source.dir).to.eql('/foo/bar');
      expect(source.toString()).to.eql(path);
    });

    it('throw (create/validate errors)', () => {
      const test = (input: any) => {
        const fn = () => ManifestSource(input);
        expect(fn).to.throw();
      };

      test('');
      test('  ');
      test(undefined);
      test(null);
      test({});
      test([]);
      test(123);
      test(true);

      // Not an ".json" file.
      test('/foo/bar');
      test('/foo/bar.js');
      test('foo/bar/index.json'); // Directory paths must be absolute.

      test('https://domain.com/ns:abc/fs/foo/index.json'); // Not a valid cell URI.
      test('https://domain.com/cell:abc:A1/foo/index.json'); // Not a "/fs/..." cell filesystem path.
    });
  });

  describe('ManifestUrl', () => {
    it('error: invalid', () => {
      const test = (input: any) => {
        const res = ManifestUrl(input);
        expect(res.ok).to.eql(false);
        expect(res.error).to.include('Invalid manifest URL');
      };

      [undefined, null, true, 123, {}, []].forEach((value) => test(value));
      test('');
      test('  ');
      test('  /foo/bar/index.json ');

      test('http://localhost/'); // not a cell URI.
      test('http://localhost/ns:foo');

      test('http://localhost/cell:foo:A1');
      test('http://localhost/cell:foo:A1/');
      test('http://localhost/cell:foo:A1/foo');
      test('http://localhost/cell:foo:A1/fs');
      test('http://localhost/cell:foo:A1/fs/  ');

      // Not a JSON file.
      test('http://localhost/cell:foo:A1/fs/foo');
      test('http://localhost/cell:foo:A1/fs/foo/bar');
    });

    it('valid (ok)', () => {
      const test = (path: string, dir: string, filename: string) => {
        const base = 'http://localhost/cell:foo:A1/fs';
        const res = ManifestUrl(`${base}/${path}`);
        expect(res.ok).to.eql(true);
        expect(res.error).to.eql(undefined);
        expect(res.dir).to.eql(dir);
        expect(res.filename).to.eql(filename);
      };

      // No directory.
      test('index.json', '', 'index.json');
      test('manifest.json', '', 'manifest.json');
      test('foo.json', '', 'foo.json');

      // Directory.
      test('foo/index.json', 'foo', 'index.json');
      test('foo/bar/boom.json', 'foo/bar', 'boom.json');
    });

    it('create', () => {
      const href = 'http://localhost:1234/cell:foo:A1/fs/dir/child/index.json?foo=123';
      const res = ManifestUrl(` ${href}  `);

      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.href).to.eql(href);
      expect(res.domain).to.eql('localhost:1234');
      expect(res.path).to.eql('dir/child/index.json');
      expect(res.dir).to.eql('dir/child');
      expect(res.filename).to.eql('index.json');
    });
  });
});
