import { expect, fs, t } from '../test';
import { Links } from '.';

describe('Links', () => {
  describe('encoding', () => {
    it('encodeKey => decodeKey', () => {
      const test = (input: string, encoded: string) => {
        const res = {
          encoded: Links.encodeKey(input),
          decoded: Links.decodeKey(Links.encodeKey(input)),
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
      const test = (prefix: string, input: string, output: string) => {
        const res1 = Links.toKey(prefix, input);
        const res2 = Links.create(prefix).toKey(input);
        expect(res1).to.eql(output);
        expect(res2).to.eql(output);
      };

      test('ref', 'foo', 'ref:foo');
      test('fs', 'foo', 'fs:foo');
      test('fs:', 'foo', 'fs:foo');
      test('fs:::', 'foo', 'fs:foo');
      test('  fs  ', 'foo', 'fs:foo');
      test('  fs::  ', 'foo', 'fs:foo');

      test('fs', 'foo.png', 'fs:foo:png');
      test('fs', '/foo.png', 'fs:foo:png');
      test('fs', '//foo.png', 'fs:foo:png');
      test('fs', 'fs.foo.png', 'fs:fs:foo:png');
      test('fs', 'cat&bird.png', 'fs:cat&bird:png');
      test('fs', 'foo/bar.png', 'fs:foo::bar:png');
      test('fs', 'foo/bar/zoo.png', 'fs:foo::bar::zoo:png');
      test('fs', '/foo/bar.png', 'fs:foo::bar:png');
      test('fs', '///foo/bar.png', 'fs:foo::bar:png');
      test('fs', 'foo/bar/', 'fs:foo::bar');
      test('fs', 'foo/bar.png/', 'fs:foo::bar:png');
    });
  });

  it('isKey', () => {
    const test = (prefix: string, key: string | undefined, expected: boolean) => {
      const res1 = Links.isKey(prefix, key);
      const res2 = Links.create(prefix).isKey(key);
      expect(res1).to.eql(expected);
      expect(res2).to.eql(expected);
    };

    test('ref', undefined, false);
    test('ref', '', false);
    test('ref', '  ', false);

    test('ref', 'ref:func:wasm', true);
    test('fs', '  fs:func:wasm  ', true);
  });

  it('total', () => {
    const test = (prefix: string, links: t.IUriMap | undefined, expected: number) => {
      const res1 = Links.total(prefix, links);
      const res2 = Links.create(prefix).total(links);
      expect(res1).to.eql(expected);
      expect(res2).to.eql(expected);
    };
    test('ref', undefined, 0);
    test('ref', {}, 0);
    test('ref', { foo: 'bar' }, 0);

    test('ref', { 'ref:foo:png': '...' }, 1);
    test('ref', { foo: 'bar', 'ref:foo:png': '...' }, 1);
    test(
      'ref',
      {
        foo: 'bar',
        'ref:file1:png': '...',
        'ref:file2:jpg': '...',
      },
      2,
    );
  });

  describe('parseKey', () => {
    it('name', () => {
      const prefix = 'foo';
      const key = Links.toKey(prefix, 'image.png');
      const res = Links.parseKey(prefix, ` ${key} `);
      expect(res.key).to.eql(key);
      expect(res.path).to.eql('image.png');
      expect(res.name).to.eql('image.png');
      expect(res.dir).to.eql('');
      expect(res.ext).to.eql('png');
    });

    it('path: dir/name', () => {
      const prefix = 'foo';
      const key = Links.toKey(prefix, '///foo/bar/image.png');
      const res = Links.parseKey(prefix, ` ${key} `);
      expect(res.key).to.eql(key);
      expect(res.path).to.eql('foo/bar/image.png');
      expect(res.name).to.eql('image.png');
      expect(res.dir).to.eql('foo/bar');
      expect(res.ext).to.eql('png');
    });

    it('path variants', () => {
      const test = (prefix: string, input: string, path: string) => {
        const res = Links.create(prefix).parseKey(input);
        expect(res.key).to.eql(input.trim());
        expect(res.path).to.eql(path);
        expect(res.name).to.eql(fs.basename(res.path));
        expect(res.dir).to.eql(fs.dirname(res.path).replace(/^\./, ''));
        expect(res.ext).to.eql(fs.extname(res.path).replace(/^\./, ''));
      };
      test('ref', 'ref:foo', 'foo');
      test('fs', 'fs:foo:png', 'foo.png');
      test('fs', 'fs:fs:foo:png', 'fs.foo.png');
      test('fs', 'fs:foo::bar:png', 'foo/bar.png');
      test('fs', 'fs:foo::bar::zoo:png', 'foo/bar/zoo.png');
      test('fs', 'fs:[::]foo:png', '..foo.png');
      test('fs', 'fs:foo[::]png', 'foo..png');
    });
  });

  describe('parseValue', () => {
    it('uri', () => {
      const res = Links.parseValue<t.ICellUri>('  cell:foo:A1   ?  ');
      expect(res.value).to.eql('cell:foo:A1'); // NB: trimmed input.
      expect(res.uri.type).to.eql('CELL');
      expect(res.uri.ns).to.eql('foo');
      expect(res.uri.key).to.eql('A1');
      expect(res.query).to.eql({});
    });

    it('query', () => {
      const res1 = Links.parseValue('cell:foo:A1');
      expect(res1.query).to.eql({});

      const res2 = Links.parseValue('  cell:foo:A1  ?  ');
      expect(res2.query).to.eql({});

      type Q = { color: string; isEnabled: boolean };
      const res3 = Links.parseValue<any, Q>('cell:foo:A1?color=red&isEnabled=true');
      const res4 = Links.parseValue<any, Q>('  cell:foo:A1 ?  color=red&isEnabled=true ');
      expect(res3.query).to.eql({ color: 'red', isEnabled: true });
      expect(res4.query).to.eql(res3.query);
    });
  });

  describe('toList', () => {
    it('empty', () => {
      const test = (links?: t.IUriMap) => {
        const res1 = Links.toList('prefix', links);
        const res2 = Links.create('prefix').toList(links);
        expect(res1).to.eql([]);
        expect(res2).to.eql([]);
      };
      test();
      test({});
      test({ 'SOMETHING:ELSE': 'foo' });
    });

    it('converts to list', () => {
      const keys = {
        'fs:main:js': 'file:foo:abc123?status=uploading',
        'fs:images/foo/kitten:png': 'file:foo:def456?hash=sha256-abc',
        'NO:MATCH': '<something>',
      };
      const list = Links.create('fs').toList(keys);
      expect(list.length).to.eql(2);

      expect(list[0].key).to.eql('fs:main:js');
      expect(list[0].value).to.eql('file:foo:abc123?status=uploading');

      expect(list[1].key).to.eql('fs:images/foo/kitten:png');
      expect(list[1].value).to.eql('file:foo:def456?hash=sha256-abc');
    });
  });

  describe('error', () => {
    it('toKey: throw if contains ":"', () => {
      const fn = () => Links.toKey('foo', 'foo:bar.png');
      expect(fn).to.throw(/cannot contain ":" character/);
    });

    it('encode: throw if contains ":"', () => {
      const fn = () => Links.encodeKey('foo:bar.png');
      expect(fn).to.throw(/cannot contain ":" character/);
    });
  });
});
