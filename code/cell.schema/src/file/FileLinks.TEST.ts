import { t, fs, expect } from '../test';
import { FileLinks } from '.';

describe.only('FileLinks', () => {
  it('prefix', () => {
    expect(FileLinks.prefix).to.eql('fs');
  });

  it('total', () => {
    const test = (links: t.IUriMap | undefined, expected: number) => {
      const res = FileLinks.total(links);
      expect(res).to.eql(expected);
    };
    test(undefined, 0);
    test({}, 0);
    test({ foo: 'bar' }, 0);

    test({ 'fs:foo:png': '...' }, 1);
    test({ foo: 'bar', 'fs:foo:png': '...' }, 1);
    test(
      {
        foo: 'bar',
        'fs:file1:png': '...',
        'fs:file2:jpg': '...',
      },
      2,
    );
  });

  describe('is', () => {
    it('fileKey', () => {
      const test = (input: string | undefined, expected: boolean) => {
        const res = FileLinks.is.fileKey(input);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test('', false);
      test('  ', false);
      test('ref:ns:foo', false);
      test('ref:cell:foo!A1', false);

      test('fs:func:wasm', true);
      test('  fs:func:wasm  ', true);
    });

    it('fileValue', () => {
      const test = (input: string | undefined, expected: boolean) => {
        const res = FileLinks.is.fileValue(input);
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
      const test = (input: string, expected: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.uri.toString()).to.eql(expected);
      };
      test('file:foo:123', 'file:foo:123');
      test('file:foo:123?hash=abc', 'file:foo:123');
      test('  file:foo:123?hash=abc  ', 'file:foo:123');
      test('file:foo:123?bam=boo&hash=abc ', 'file:foo:123');
    });

    it('(ns)', () => {
      const test = (input: string, expected: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.uri.ns).to.eql(expected);
      };
      test('file:foo:123', 'foo');
      test('file:foo:123?hash=abc', 'foo');
      test('  file:foo:123?hash=abc  ', 'foo');
      test('file:foo:123?bam=boo&hash=abc ', 'foo');
    });

    it('(fileid)', () => {
      const test = (input: string, expected: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.uri.file).to.eql(expected);
      };
      test('file:foo:123', '123');
      test('file:foo:123?hash=abc', '123');
      test('  file:foo:123?hash=abc  ', '123');
      test('file:foo:123?bam=boo&hash=abc ', '123');
    });

    it('(hash)', () => {
      const test = (input: string, expected?: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.hash).to.eql(expected);
      };
      test('file:foo:123', undefined);
      test('file:foo:123?hash=abc', 'abc');
      test('  file:foo:123?hash=abc  ', 'abc');
      test('file:foo:123?bam=boo', undefined);
      test('file:foo:123?bam=boo&hash=abc ', 'abc');
    });

    it('(status)', () => {
      const test = (input: string, expected?: string) => {
        const res = FileLinks.parseLink(input);
        expect(res.status).to.eql(expected);
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
    it('name', () => {
      const key = FileLinks.toKey('image.png');
      const res = FileLinks.parseKey(` ${key} `);
      expect(res.key).to.eql(key);
      expect(res.path).to.eql('image.png');
      expect(res.name).to.eql('image.png');
      expect(res.dir).to.eql('');
      expect(res.ext).to.eql('png');
    });

    it('path: dir/name', () => {
      const key = FileLinks.toKey('///foo/bar/image.png');
      const res = FileLinks.parseKey(` ${key} `);
      expect(res.key).to.eql(key);
      expect(res.path).to.eql('foo/bar/image.png');
      expect(res.name).to.eql('image.png');
      expect(res.dir).to.eql('foo/bar');
      expect(res.ext).to.eql('png');
    });

    it('path variants', () => {
      const test = (input: string, path: string) => {
        const res = FileLinks.parseKey(input);
        expect(res.key).to.eql(input.trim());
        expect(res.path).to.eql(path);
        expect(res.name).to.eql(fs.basename(res.path));
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

  describe('toList', () => {
    it('empty', () => {
      const test = (keys?: t.IUriMap) => {
        const res = FileLinks.toList(keys);
        expect(res).to.eql([]);
      };
      test();
      test({});
      test({ 'SOMETHING:ELSE': 'foo' });
    });

    it('converts to list', () => {
      const keys = {
        'fs:main:js': 'file:foo:abc123?status=uploading',
        'fs:images/foo/kitten:png': 'file:foo:def456?hash=sha256-abc',
      };

      const list = FileLinks.toList(keys);
      expect(list.length).to.eql(2);

      expect(list[0].uri).to.eql('file:foo:abc123');
      expect(list[0].hash).to.eql(undefined);
      expect(list[0].status).to.eql('uploading');
      expect(list[0].file.ns).to.eql('foo');
      expect(list[0].file.id).to.eql('abc123');
      expect(list[0].file.path).to.eql('main.js');
      expect(list[0].file.dir).to.eql('');
      expect(list[0].file.filename).to.eql('main.js');
      expect(list[0].file.ext).to.eql('js');

      expect(list[1].uri).to.eql('file:foo:def456');
      expect(list[1].hash).to.eql('sha256-abc');
      expect(list[1].status).to.eql(undefined);
      expect(list[1].file.ns).to.eql('foo');
      expect(list[1].file.id).to.eql('def456');
      expect(list[1].file.path).to.eql('images/foo/kitten.png');
      expect(list[1].file.dir).to.eql('images/foo');
      expect(list[1].file.filename).to.eql('kitten.png');
      expect(list[1].file.ext).to.eql('png');
    });
  });

  describe('find: byName', () => {
    const KEYS = {
      'fs:main:js': 'file:foo:abc123?status=uploading',
      'fs:images/foo/kitten:png': 'file:foo:def456?hash=sha256-abc',
    };

    it('no match', () => {
      const test = (keys: t.IUriMap | undefined, path?: string) => {
        const res = FileLinks.find(keys).byName(path);
        expect(res).to.eql(undefined);
      };
      test(undefined, 'main.js');
      test(undefined, undefined);
      test({}, 'main.js');
      test(KEYS, 'no-match.pdf');
      test(KEYS, '');
      test(KEYS, '  ');
      test(KEYS, undefined);
      test(KEYS, 'main.js/');
    });

    it('match: main.js', () => {
      const test = (path?: string) => {
        const res = FileLinks.find(KEYS).byName(path);
        expect(res?.uri).to.eql('file:foo:abc123');
        expect(res?.file.path).to.eql('main.js');
      };
      test('main.js');
      test('   main.js   ');
      test('/main.js');
      test(' //main.js ');
    });

    it('match: images/foo/kitten.png', () => {
      const test = (path?: string) => {
        const res = FileLinks.find(KEYS).byName(path);
        expect(res?.uri).to.eql('file:foo:def456');
        expect(res?.file.path).to.eql('images/foo/kitten.png');
      };
      test('images/foo/kitten.png');
      test('   images/foo/kitten.png   ');
      test('/images/foo/kitten.png');
      test('///images/foo/kitten.png');
    });
  });

  describe('error', () => {
    it('toKey: throw if contains ":"', () => {
      const fn = () => FileLinks.toKey('foo:bar.png');
      expect(fn).to.throw(/cannot contain ":" character/);
    });
  });
});
