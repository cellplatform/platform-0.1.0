import { Test, expect } from '../test';
import { ModuleUrl } from '.';

export default Test.describe('Module.Url', (e) => {
  e.describe('parseUrl', (e) => {
    e.it('manifest: appends "/index.json" to path', () => {
      const test = (href: string, expected: string) => {
        const url = ModuleUrl.parseUrl(href);
        expect(url.href).to.eql(expected);
        expect(url.manifest).to.eql(expected);
      };

      test('https://domain.com', 'https://domain.com/index.json');
      test('https://domain.com/', 'https://domain.com/index.json');
      test('https://domain.com///', 'https://domain.com/index.json');
      test('https://domain.com/foo', 'https://domain.com/foo/index.json');
    });

    e.it('no entry on href', () => {
      const url = ModuleUrl.parseUrl('https://domain.com/index.json');
      expect(url.entry).to.eql(undefined);
    });

    e.it('entry on href (format path)', () => {
      const url = ModuleUrl.parseUrl('https://domain.com/index.json?entry=foo');
      expect(url.entry).to.eql('./foo');
      expect(url.manifest).to.eql('https://domain.com/index.json');
      expect(url.href).to.eql('https://domain.com/index.json?entry=.%2Ffoo'); // NB: encoded "./" auto added.
    });

    e.it('"?entry=none" on href', () => {
      const url = ModuleUrl.parseUrl('https://domain.com/index.json?entry=none');
      expect(url.entry).to.eql(undefined);
      expect(url.href).to.eql('https://domain.com/index.json');
      expect(url.manifest).to.eql('https://domain.com/index.json');
    });

    e.it('"?entry" on href', () => {
      const test = (query: string) => {
        const url = ModuleUrl.parseUrl(`https://domain.com/index.json?${query}`);
        expect(url.entry).to.eql(undefined);
        expect(url.href).to.eql('https://domain.com/index.json');
        expect(url.manifest).to.eql('https://domain.com/index.json');
      };
      test('entry');
      test('entry=');
    });

    e.it('{entry} on options', () => {
      const url = ModuleUrl.parseUrl('https://domain.com', { entry: 'foo' });
      expect(url.entry).to.eql('./foo');
      expect(url.manifest).to.eql('https://domain.com/index.json');
      expect(url.href).to.eql('https://domain.com/index.json?entry=.%2Ffoo');
    });

    e.it('{entry} on options overrides URL query string', () => {
      const url = ModuleUrl.parseUrl('https://domain.com/index.json?entry=foo', { entry: 'bar' });
      expect(url.entry).to.eql('./bar');
      expect(url.manifest).to.eql('https://domain.com/index.json');
      expect(url.href).to.eql('https://domain.com/index.json?entry=.%2Fbar');
    });

    e.it('error', () => {
      const url = ModuleUrl.parseUrl('https://@#&');
      expect(url.error).to.include('Failed to parse href');
      expect(url.error).to.include('"https://@#&"');
      expect(url.href).to.eql('');
      expect(url.manifest).to.eql('');
      expect(url.entry).to.eql(undefined);
    });
  });

  e.describe('path', (e) => {
    e.it('parse into: path, filename, { name, ext }', () => {
      const test = (input: string, path: string, filename: string, name?: string, ext?: string) => {
        const res = ModuleUrl.path(input);

        expect(res.path).to.eql(path);
        expect(res.filename).to.eql(filename);

        expect(res.file?.name).to.eql(name);
        expect(res.file?.ext).to.eql(ext);
      };

      test('', '/', '');
      test('   ', '/', '');

      test('/', '/', '');
      test('   /  ', '/', '');
      test('/dir', '/dir/', '');
      test('dir', '/dir/', '');
      test('foo/bar', '/foo/bar/', '');
      test('  foo/bar  ', '/foo/bar/', '');
      test('foo/filejs', '/foo/filejs/', '');

      test('/file.js', '/', 'file.js', 'file', 'js');
      test('file.js', '/', 'file.js', 'file', 'js');
      test('   file.js   ', '/', 'file.js', 'file', 'js');

      test('foo/file.js', '/foo/', 'file.js', 'file', 'js');
      test(' ///foo/bar/file.js ', '/foo/bar/', 'file.js', 'file', 'js');

      test('foo/file.js/', '/foo/file.js/', ''); // NB: The end "/" indicates this is not a file-path.
    });

    e.it('is file', () => {
      ModuleUrl.fileExtensions.forEach((ext) => {
        const filename = `file.${ext}`;
        const path = `/foo/${filename}`;
        const res = ModuleUrl.path(path);
        expect(res.filename).to.eql(filename);
        expect(res.file?.name).to.eql('file');
        expect(res.file?.ext).to.eql(ext);
      });
    });
  });

  e.it('ensureManifest', () => {
    const test = (href: string, expected: string) => {
      const res = ModuleUrl.ensureManifest(href);
      expect(res.href).to.eql(expected);
    };

    test('https://domain.com/', 'https://domain.com/index.json');
    test('  https://domain.com  ', 'https://domain.com/index.json');
    test('https://domain.com/path', 'https://domain.com/path/index.json');

    test('https://domain.com/remote.js', 'https://domain.com/index.json');
    test('https://domain.com/path/remote.js', 'https://domain.com/path/index.json');
    test('https://domain.com/path/remote.js?qs', 'https://domain.com/path/index.json?qs');
  });

  e.it('removeFilename', () => {
    const test = (href: string, expected: string) => {
      const res = ModuleUrl.removeFilename(href);
      expect(res.href).to.eql(expected);
    };

    test('https://domain.com/', 'https://domain.com/');
    test('  https://domain.com  ', 'https://domain.com/');
    test('  https://domain.com/foo/bar.png  ', 'https://domain.com/foo/');
    test('https://domain.com/bar.png  ', 'https://domain.com/');
  });

  e.it('formatEntryPath', () => {
    const test = (path: string, expected: string) => {
      const res = ModuleUrl.formatEntryPath(path);
      expect(res).to.eql(expected);
    };

    test('Dev', './Dev');
    test('  Dev  ', './Dev');
    test('./Dev', './Dev');
    test('  ./Dev  ', './Dev');

    test('./', '');
  });

  e.it('trimEntryPath', () => {
    const test = (path: string, expected: string) => {
      const res = ModuleUrl.trimEntryPath(path);
      expect(res).to.eql(expected);
    };

    test('Dev', 'Dev');
    test('./Dev', 'Dev');
    test('  ./Dev  ', 'Dev');
  });

  e.it('stripHttp', () => {
    const test = (input: string, expected: string) => {
      const res = ModuleUrl.stripHttp(input);
      expect(res).to.eql(expected);
    };

    test(undefined as any, '');
    test('', '');
    test('foo.com', 'foo.com');
    test('http://localhost:1234', 'localhost:1234');
    test('https://foo.com', 'foo.com');
    test('  https://foo.com  ', 'foo.com');
  });
});
