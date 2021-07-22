import { ManifestUrl } from '.';
import { expect } from '../../test';

describe.only('ManifestUrl', () => {
  describe('ManifestUrl.parse: [ParseManifestUrl]', () => {
    it('error: invalid', () => {
      const test = (input: any) => {
        const res = ManifestUrl.parse(input);
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
        const res = ManifestUrl.parse(`${base}/${path}`);
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
      const res = ManifestUrl.parse(` ${href}  `);

      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.href).to.eql(href);
      expect(res.domain).to.eql('localhost:1234');
      expect(res.path).to.eql('dir/child/index.json');
      expect(res.dir).to.eql('dir/child');
      expect(res.filename).to.eql('index.json');
    });
  });

  describe('ManifestUrl.create [CreateMaifestUrl]', () => {
    it.skip('entry', () => {
      const url = ManifestUrl.create(1234);
      const entry = url.entry();

      /**
       * TODO 🐷
       * See [Controller.status] for URL generation.
       */
    });
  });
});
