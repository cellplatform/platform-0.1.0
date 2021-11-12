import { ManifestUrl } from '.';
import { expect } from '../../test';

describe('ManifestUrl', () => {
  describe('parse', () => {
    it('cell (uri)', () => {
      const href = 'http://localhost:1234/cell:foo:A1/fs/dir/child/index.json?foo=123';
      const res = ManifestUrl.parse(` ${href}  `);

      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.entry).to.eql('');
      expect(res.href).to.eql(href);
      expect(res.domain).to.eql('localhost:1234');
      expect(res.path).to.eql('dir/child/index.json');
      expect(res.dir).to.eql('dir/child');
      expect(res.filename).to.eql('index.json');
      expect(res.cell).to.eql('cell:foo:A1');
    });

    it('non-cell (url)', () => {
      const href = 'https://domain.com/foo/index.json?foo=123';
      const res = ManifestUrl.parse(` ${href}  `);

      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.entry).to.eql('');
      expect(res.href).to.eql(href);
      expect(res.domain).to.eql('domain.com');
      expect(res.path).to.eql('foo/index.json');
      expect(res.dir).to.eql('foo');
      expect(res.filename).to.eql('index.json');
      expect(res.cell).to.eql('');
      expect(Boolean(res.cell)).to.eql(false);
    });
  });

  describe('entry', () => {
    it('empty string ("") - nothing', () => {
      const test = (path: string) => {
        const href = `  https://domain.com/${path}  `;
        const res = ManifestUrl.parse(href);
        expect(res.ok).to.eql(true);
        expect(res.entry).to.eql('');
      };

      test('index.json');
      test('foo/index.json');
      test('foo/index.json?');
      test('foo/index.json?foo=123');
      test('foo/index.json?entry');
      test('foo/index.json?entry=');
    });

    it('entry path', () => {
      const test = (path: string, expected: string) => {
        const href = `  https://domain.com/${path}  `;
        const res = ManifestUrl.parse(href);
        expect(res.ok).to.eql(true);
        expect(res.entry).to.eql(expected);
      };

      test('index.json?entry=foo', 'foo');
      test('index.json?entry=./DEV.ui.video', './DEV.ui.video');
    });
  });

  describe('valid', () => {
    it('cell (uri)', () => {
      const test = (path: string, dir: string, filename: string) => {
        const base = 'http://localhost/cell:foo:A1/fs';
        const res = ManifestUrl.parse(`${base}/${path}`);
        expect(res.ok).to.eql(true);
        expect(res.error).to.eql(undefined);
        expect(res.dir).to.eql(dir);
        expect(res.filename).to.eql(filename);
        expect(Boolean(res.cell)).to.eql(true);
      };

      // No directory.
      test('index.json', '', 'index.json');
      test('manifest.json', '', 'manifest.json');
      test('foo.json', '', 'foo.json');

      // Directory.
      test('foo/index.json', 'foo', 'index.json');
      test('foo/bar/boom.json', 'foo/bar', 'boom.json');
    });

    it('non-cell (url)', () => {
      const test = (path: string, dir: string, filename: string) => {
        const base = 'http://localhost';
        const res = ManifestUrl.parse(`${base}/${path}`);
        expect(res.ok).to.eql(true);
        expect(res.error).to.eql(undefined);
        expect(res.dir).to.eql(dir);
        expect(res.filename).to.eql(filename);
        expect(Boolean(res.cell)).to.eql(false);
      };

      // No directory.
      test('index.json', '', 'index.json');
      test('manifest.json', '', 'manifest.json');
      test('foo.json', '', 'foo.json');

      // Directory.
      test('foo/index.json', 'foo', 'index.json');
      test('foo/bar/boom.json', 'foo/bar', 'boom.json');
    });
  });

  describe('invalid (error)', () => {
    const test = (input: any) => {
      const res = ManifestUrl.parse(input);
      expect(res.ok).to.eql(false, input);
      expect(res.error).to.include('Invalid manifest URL', input);
    };

    it('input type', () => {
      [undefined, null, true, 123, {}, []].forEach((value) => test(value));
    });

    it('empty ("")', () => {
      test('');
      test('  ');
    });

    it('invalid url format', () => {
      test('  /foo/bar/index.json ');

      test('http://localhost/'); // no path
      test('http://localhost/ns:foo'); // not a cell URI.

      test('http://localhost/cell:foo:A1');
      test('http://localhost/cell:foo:A1/');
      test('http://localhost/cell:foo:A1/foo');
      test('http://localhost/cell:foo:A1/fs');
      test('http://localhost/cell:foo:A1/fs/  ');

      // Not a JSON file.
      test('http://localhost/cell:foo:A1/fs/foo');
      test('http://localhost/cell:foo:A1/fs/foo/bar');
    });
  });
});
