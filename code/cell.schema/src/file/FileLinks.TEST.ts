import { fs, expect } from '../test';
import { FileLinks } from '.';

describe('FileLinks', () => {
  describe('is', () => {
    it('fileKey', () => {
      const test = (key: string | undefined, expected: boolean) => {
        const res = FileLinks.is.fileKey(key);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test('', false);
      test('  ', false);

      test('fs:func:wasm', true);
      test('  fs:func:wasm  ', true);
    });

    it('fileValue', () => {
      const test = (key: string | undefined, expected: boolean) => {
        const res = FileLinks.is.fileValue(key);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test('', false);
      test('  ', false);
      test('fs:func:wasm', false);

      test('file:foo:abc', true);
    });

    it('fileUploading', () => {
      const test = (key: string | undefined, expected: boolean) => {
        const res = FileLinks.is.fileUploading(key);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test('', false);
      test('  ', false);
      test('fs:func:wasm', false);

      test('file:foo:abc', false);
      test('file:foo:abc?status=', false);
      test('file:foo:abc?status=derp', false);

      test('  file:foo:abc?status=uploading  ', true);
      test('file:foo:abc?something=true&status=uploading  ', true);
    });
  });

  describe('encoding', () => {
    it('encodeKey => decodeKey', () => {
      const test = (input: string, encoded: string) => {
        const res = {
          encoded: FileLinks.encodeKey(input),
          decoded: FileLinks.decodeKey(FileLinks.encodeKey(input)),
        };
        expect(res.encoded).to.eql(encoded);
        expect(res.decoded).to.eql(input);
      };

      test('foo', 'foo');
      test('foo|bar', 'foo|bar');
      test('[foo]', '[foo]');
      test('.foo', ':foo');
      test('[.foo]', '[:foo]');
      test('foo.png', 'foo:png');
      test('foo.bar.baz', 'foo:bar:baz');
      test('foo/bar', 'foo::bar');
      test('foo/bar/baz', 'foo::bar::baz');

      test('.foo.', ':foo:');
      test('..foo...', '[::]foo[:::]');
      test('...foo.', '[:::]foo:');
      test('...foo.png', '[:::]foo:png');
      test('...foo/bar..png', '[:::]foo::bar[::]png');
      test('[..]foo[...]', '[[::]]foo[[:::]]');
    });

    it('toKey (encoded)', () => {
      const test = (input: string, output: string) => {
        const res = FileLinks.toKey(input);
        expect(res).to.eql(output);
      };
      test('foo', 'fs:foo');
      test('foo.png', 'fs:foo:png');
      test('/foo.png', 'fs:foo:png');
      test('//foo.png', 'fs:foo:png');
      test('fs.foo.png', 'fs:fs:foo:png');
      test('cat&bird.png', 'fs:cat&bird:png');
      test('foo/bar.png', 'fs:foo::bar:png');
      test('foo/bar/zoo.png', 'fs:foo::bar::zoo:png');
      test('/foo/bar.png', 'fs:foo::bar:png');
      test('///foo/bar.png', 'fs:foo::bar:png');
      test('foo/bar/', 'fs:foo::bar');
      test('foo/bar.png/', 'fs:foo::bar:png');
    });
  });

  describe('parseLink', () => {
    it('(uri)', () => {
      const test = (input: string, expectedUri: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.uri).to.eql(expectedUri);
      };
      test('file:foo:123', 'file:foo:123');
      test('file:foo:123?hash=abc', 'file:foo:123');
      test('  file:foo:123?hash=abc  ', 'file:foo:123');
      test('file:foo:123?bam=boo&hash=abc ', 'file:foo:123');
    });

    it('(hash)', () => {
      const test = (input: string, expectedHash?: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.hash).to.eql(expectedHash);
      };
      test('file:foo:123', undefined);
      test('file:foo:123?hash=abc', 'abc');
      test('  file:foo:123?hash=abc  ', 'abc');
      test('file:foo:123?bam=boo', undefined);
      test('file:foo:123?bam=boo&hash=abc ', 'abc');
    });

    it('(status)', () => {
      const test = (input: string, expectedStatus?: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.status).to.eql(expectedStatus);
      };
      test('file:foo:123', undefined);
      test('file:foo:123?hash=abc', undefined);
      test('  file:foo:123?hash=abc&status=uploading  ', 'uploading');
      test('file:foo:123?hash=abc&status=foo', 'foo');
    });

    it('toString', () => {
      const test = (input: string, expected: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.toString()).to.eql(expected);
      };

      test('file:foo:123', 'file:foo:123');
      test('  file:foo:123  ', 'file:foo:123');
      test('file:foo:123?', 'file:foo:123');
      test('  file:foo:123?hash=abc  ', 'file:foo:123?hash=abc');
      test('  file:foo:123?status=uploading  ', 'file:foo:123?status=uploading');
      test('  file:foo:123?hash=abc&status=uploading  ', 'file:foo:123?status=uploading&hash=abc'); // NB: order corrected.
    });

    it('toString: modify query-string values', () => {
      const test = (args: { hash?: string | null; status?: string | null }, expected: string) => {
        expect(FileLinks.parseLink('file:foo:123').toString(args)).to.eql(expected);
        expect(FileLinks.parseLink('  file:foo:123  ').toString(args)).to.eql(expected);
      };
      test({}, 'file:foo:123');
      test({ hash: 'abc' }, 'file:foo:123?hash=abc');
      test({ status: 'uploading' }, 'file:foo:123?status=uploading');
      test({ hash: 'abc', status: 'uploading' }, 'file:foo:123?status=uploading&hash=abc');
    });

    it('toString: remove query-string values', () => {
      const test = (args: { hash?: string | null; status?: string | null }, expected: string) => {
        const res = FileLinks.parseLink('file:foo:123?status=uploading&hash=abc').toString(args);
        expect(res).to.eql(expected);
      };
      test({}, 'file:foo:123?status=uploading&hash=abc'); // NB: No change.
      test({ status: null }, 'file:foo:123?hash=abc'); // NB: No change.
      test({ hash: null }, 'file:foo:123?status=uploading');
      test({ hash: null, status: null }, 'file:foo:123');
    });

    it('throw: file URI not provided', () => {
      const fn = () => FileLinks.parseLink('cell:foo!A1');
      expect(fn).to.throw();
    });
  });

  describe('parseKey', () => {
    it('filename', () => {
      const key = FileLinks.toKey('image.png');
      const res = FileLinks.parseKey(` ${key} `);
      expect(res.key).to.eql(key);
      expect(res.path).to.eql('image.png');
      expect(res.filename).to.eql('image.png');
      expect(res.dir).to.eql('');
      expect(res.ext).to.eql('png');
    });

    it('path: dir/name', () => {
      const key = FileLinks.toKey('///foo/bar/image.png');
      const res = FileLinks.parseKey(` ${key} `);
      expect(res.key).to.eql(key);
      expect(res.path).to.eql('foo/bar/image.png');
      expect(res.filename).to.eql('image.png');
      expect(res.dir).to.eql('foo/bar');
      expect(res.ext).to.eql('png');
    });

    it('path variants', () => {
      const test = (input: string, path: string) => {
        const res = FileLinks.parseKey(input);
        expect(res.key).to.eql(input.trim());
        expect(res.path).to.eql(path);
        expect(res.filename).to.eql(fs.basename(res.path));
        expect(res.dir).to.eql(fs.dirname(res.path).replace(/^\./, ''));
        expect(res.ext).to.eql(fs.extname(res.path).replace(/^\./, ''));
      };
      test('fs:foo', 'foo');
      test('fs:foo:png', 'foo.png');
      test('fs:fs:foo:png', 'fs.foo.png');
      test('fs:foo::bar:png', 'foo/bar.png');
      test('fs:foo::bar::zoo:png', 'foo/bar/zoo.png');
      test('fs:[::]foo:png', '..foo.png');
      test('fs:foo[::]png', 'foo..png');
    });
  });

  describe('error', () => {
    it('toKey: throw if contains ":"', () => {
      const fn = () => FileLinks.toKey('foo:bar.png');
      expect(fn).to.throw(/cannot contain ":" character/);
    });

    it('encode: throw if contains ":"', () => {
      const fn = () => FileLinks.encodeKey('foo:bar.png');
      expect(fn).to.throw(/cannot contain ":" character/);
    });
  });
});
