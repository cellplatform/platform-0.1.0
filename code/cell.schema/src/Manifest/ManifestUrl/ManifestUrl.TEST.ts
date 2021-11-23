import { expect, R, t } from '../../test';
import { ManifestUrl } from '.';

describe.only('ManifestUrl', () => {
  const MANIFEST: t.ModuleManifest = {
    kind: 'module',
    hash: {
      files: 'sha256-73794e8fb93173aaa883aa595b322c3976596e2cb58fff4210c74643ca0ad56c',
      module: 'sha256-94aacbf4ae6c5ab206b3d4cb5674fdecebf1f814b54f1fbfec646760edd23549',
    },
    module: {
      namespace: 'mock.foobar',
      version: '0.0.0',
      compiler: '@platform/cell.compiler@0.0.0',
      compiledAt: 1636667570203,
      mode: 'production',
      target: 'web',
      entry: 'index.html',
      remote: {
        entry: 'remoteEntry.js',
        exports: [{ path: './Dev' }],
      },
    },
    files: [],
  };

  describe('parse', () => {
    it('cell (uri)', () => {
      const href = 'http://localhost:1234/cell:foo:A1/fs/dir/child/index.json?foo=123';
      const url = ManifestUrl.parse(` ${href}  `);

      expect(url.ok).to.eql(true);
      expect(url.error).to.eql(undefined);
      expect(url.params.entry).to.eql('');
      expect(url.href).to.eql(href);
      expect(url.domain).to.eql('localhost:1234');
      expect(url.path).to.eql('dir/child/index.json');
      expect(url.dir).to.eql('dir/child');
      expect(url.filename).to.eql('index.json');
      expect(url.cell).to.eql('cell:foo:A1');
    });

    it('non-cell (url)', () => {
      const href = 'https://domain.com/foo/index.json?foo=123';
      const url = ManifestUrl.parse(` ${href}  `);

      expect(url.ok).to.eql(true);
      expect(url.error).to.eql(undefined);
      expect(url.params.entry).to.eql('');
      expect(url.href).to.eql(href);
      expect(url.domain).to.eql('domain.com');
      expect(url.path).to.eql('foo/index.json');
      expect(url.dir).to.eql('foo');
      expect(url.filename).to.eql('index.json');
      expect(url.cell).to.eql('');
      expect(Boolean(url.cell)).to.eql(false);
    });

    it('domain:<port>', () => {
      const test = (href: string, dir: string, filename: string) => {
        const url = ManifestUrl.parse(href);
        expect(url.dir).to.eql(dir);
        expect(url.filename).to.eql(filename);
        expect(url.path).to.eql(`${dir ? `${dir}/` : dir}${filename}`);
      };

      test('http://localhost:1234/foo/index.json?foo=123', 'foo', 'index.json');
      test('localhost:1234/foo/index.json?foo=123', 'foo', 'index.json');
      test('localhost:1234/index.json?foo=123', '', 'index.json');
      test('domain.com:8080/index.json?foo=123', '', 'index.json');
    });

    it('protocol', () => {
      const test = (href: string, expected: string) => {
        const url = ManifestUrl.parse(href);
        expect(url.protocol).to.eql(expected);
      };

      test('http://localhost:1234/foo/index.json', 'http');
      test('localhost:1234/foo/index.json', 'http');

      test('domain.com/foo/index.json', 'https');
      test('https://domain.com/foo/index.json', 'https');
      test('http://domain.com/foo/index.json', 'https');
    });

    describe('entry', () => {
      it('empty string ("") - nothing', () => {
        const test = (path: string) => {
          const href = `  https://domain.com/${path}  `;
          const url = ManifestUrl.parse(href);
          expect(url.ok).to.eql(true);
          expect(url.params.entry).to.eql('');
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
          const url = ManifestUrl.parse(href);
          expect(url.ok).to.eql(true);
          expect(url.params.entry).to.eql(expected);
        };
        test('index.json?entry=foo', 'foo');
        test('index.json?entry=./DEV.ui.video', './DEV.ui.video');
      });
    });

    describe('valid', () => {
      it('cell (uri)', () => {
        const test = (input: string, dir: string, filename: string) => {
          const url = ManifestUrl.parse(`  ${input}  `);

          expect(url.ok).to.eql(true);
          expect(url.error).to.eql(undefined);
          expect(url.dir).to.eql(dir);
          expect(url.filename).to.eql(filename);
          expect(Boolean(url.cell)).to.eql(true);
        };

        // No directory.
        test('http://localhost/cell:foo:A1/fs/index.json', '', 'index.json');
        test('http://localhost/cell:foo:A1/fs/manifest.json', '', 'manifest.json');
        test('http://localhost/cell:foo:A1/fs/foo.json', '', 'foo.json');

        // Directory.
        test('http://localhost/cell:foo:A1/fs/foo/index.json', 'foo', 'index.json');
        test('http://localhost/cell:foo:A1/fs/foo/bar/boom.json', 'foo/bar', 'boom.json');
      });

      it('non-cell (url)', () => {
        const test = (input: string, dir: string, filename: string) => {
          const url = ManifestUrl.parse(`  ${input}  `);
          expect(url.ok).to.eql(true);
          expect(url.error).to.eql(undefined);
          expect(url.dir).to.eql(dir);
          expect(url.filename).to.eql(filename);
          expect(Boolean(url.cell)).to.eql(false);
        };

        // No directory.
        test('http://localhost/index.json', '', 'index.json');
        test('http://localhost/manifest.json', '', 'manifest.json');
        test('http://localhost/foo.json', '', 'foo.json');
        test('https://domain.com/index.json', '', 'index.json');

        // Directory.
        test('http://localhost/foo/index.json', 'foo', 'index.json');
        test('http://localhost/foo/bar/boom.json', 'foo/bar', 'boom.json');
        test('https://domain.com/foo/bar/index.json', 'foo/bar', 'index.json');
      });
    });

    describe('invalid (error)', () => {
      const test = (input: any) => {
        const url = ManifestUrl.parse(input);
        expect(url.ok).to.eql(false, input);
        expect(url.error).to.include('Invalid manifest URL', input);
      };

      it('input type', () => {
        [undefined, null, true, 123, {}, []].forEach((value) => test(value));
      });

      it('empty ("")', () => {
        test('');
        test('  ');
      });

      it('invalid url format', () => {
        // No path.
        test('http://localhost/');
        test('localhost/');
        test('localhost:1234');
        test('domain.com');

        test('http://localhost/ns:foo'); // Not a cell URI.

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

  describe('params', () => {
    it('modify: entry', () => {
      const url1 = ManifestUrl.parse('https://domain.com:8080/foo/index.json');
      const url2 = ManifestUrl.params(url1, { entry: ' ./foo/bar ' });

      expect(url1).to.not.eql(url2);
      expect(url2.href).to.eql('https://domain.com:8080/foo/index.json?entry=./foo/bar');

      expect(url1.params.entry).to.eql('');
      expect(url2.params.entry).to.eql('./foo/bar');
    });
  });

  describe('toRemoteEntryUrl', () => {
    it('derives "remoteyEntry.js" endpoint', () => {
      const test = (href: string, expected: string) => {
        const res1 = ManifestUrl.toRemoteEntryUrl(href, MANIFEST);
        const res2 = ManifestUrl.toRemoteEntryUrl(ManifestUrl.parse(href), MANIFEST);
        expect(res1).to.eql(expected);
        expect(res2).to.eql(expected);
      };

      test('https://domain.com/foo/index.json', 'https://domain.com/foo/remoteEntry.js');
      test('domain.com/foo/index.json', 'https://domain.com/foo/remoteEntry.js');
      test('localhost:1234/foo/index.json', 'http://localhost:1234/foo/remoteEntry.js');
      test('localhost/index.json', 'http://localhost/remoteEntry.js');
    });

    it('no {remote} section within manifest', () => {
      const test = (href: string) => {
        const manifest = R.clone(MANIFEST);
        delete manifest.module.remote;
        expect(ManifestUrl.toRemoteEntryUrl(href, manifest)).to.eql('');
      };

      test('domain.com/foo/index.json');
      test('domain.com/index.json');
    });

    it('no manifest (undefined)', () => {
      const href = 'domain.com/foo/index.json';
      expect(ManifestUrl.toRemoteEntryUrl(href, undefined)).to.eql('');
    });

    it('error', () => {
      const url = ManifestUrl.parse('domain.com/fail/');
      expect(url.error).to.include('Invalid manifest URL');

      const fn = () => ManifestUrl.toRemoteEntryUrl(url, MANIFEST);
      expect(fn).to.throw(/Failed to derive remote-entry URL/);
    });
  });

  describe('toRemoteImport', () => {
    it('success', () => {
      const entry = './Foo';
      const res = ManifestUrl.toRemoteImport('localhost/foo/index.json', MANIFEST, entry);

      expect(res.url).to.eql('http://localhost/foo/remoteEntry.js');
      expect(res.namespace).to.eql(MANIFEST.module.namespace);
      expect(res.entry).to.eql(entry);
    });

    it('error: invalid URL', () => {
      const entry = './Foo';
      const url = ManifestUrl.parse('domain.com/fail/');

      const fn = () => ManifestUrl.toRemoteImport(url, MANIFEST, entry);
      expect(fn).to.throw(/Failed to derive remote-entry URL/);
    });
  });
});
