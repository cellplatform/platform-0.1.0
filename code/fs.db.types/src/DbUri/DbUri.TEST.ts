import { expect } from 'chai';
import { DbUri } from './DbUri';
import { t } from '../common';

describe.only('DbUri', () => {
  describe('constructor', () => {
    it('constructs (with default values)', () => {
      const uri = DbUri.create({});
      expect(uri.schemes).to.eql(['data']);
    });

    it('constructs with custom schemes', () => {
      expect(DbUri.create({ scheme: 'foo' }).schemes).to.eql(['foo']);
      expect(DbUri.create({ scheme: ['foo', 'bar'] }).schemes).to.eql(['foo', 'bar']);
    });
  });

  describe('parse', () => {
    const uri = DbUri.create({});

    it('scheme: data', () => {
      expect(uri.parse('data:path').scheme).to.eql('data');
    });

    it('scheme: "foo" (custom)', () => {
      const uri = DbUri.create({ scheme: 'foo' });
      expect(uri.parse('foo:path').scheme).to.eql('foo');
      expect(uri.parse('foo:path').ok).to.eql(true);
      expect(uri.parse('foo:path').errors).to.eql([]);

      expect(uri.parse('data:path').scheme).to.eql(''); // Not supported.
      expect(uri.parse('data:path').ok).to.eql(false);
    });

    it('path', () => {
      const test = (input: string, path: string) => {
        const res = uri.parse(input);
        expect(res.path.text).to.eql(path);
        expect(res.path.toString()).to.eql(path);
      };
      test('data:foo', 'foo');
      test('data:foo/', 'foo');
      test('data:foo//', 'foo');
      test('data:/foo/', 'foo');
      test('data://foo/bar', 'foo/bar');
      test('data://foo/bar/', 'foo/bar');
      test('data:///foo/', 'foo');
      test('data:///foo/bar///////', 'foo/bar');
      test('data:foo/*', 'foo');
      test('data:foo/**', 'foo');
      test('data:', '');
      test('data', 'data'); // No "scheme", not a URI so path is assumed.
      test('data:foo:name.first', 'foo'); // Does not include object-path.
    });

    it('object', () => {
      const test = (input: string, objectPath: string) => {
        const res = uri.parse(input);
        expect(res.object.text).to.eql(objectPath);
        expect(res.object.toString()).to.eql(objectPath);
      };
      test('data:foo:name', 'name');
      test('data:foo:name.first', 'name.first');
      test(' data:foo:name.{first="fred"} ', 'name.{first="fred"}');
    });

    it('ok (errors)', () => {
      const test = (input: string, ok: boolean, errors: t.DbUriError[] = []) => {
        const res = uri.parse(input);
        expect(res.ok).to.eql(ok);
        expect(res.errors).to.eql(errors);
      };

      test('', false, ['NO_SCHEME', 'NO_PATH']);
      test('  ', false, ['NO_SCHEME', 'NO_PATH']);
      test('foo/bar', false, ['NO_SCHEME']);
      test('data:', false, ['NO_PATH']);
      test('data:foo', true);
      test('data:foo:name.first', true);
    });

    it('no scheme, read out as path', () => {
      const res = uri.parse(' foo/bar  ');
      expect(res.path.text).to.eql('foo/bar');
      expect(res.path.toString()).to.eql('foo/bar');
      expect(res.ok).to.eql(false); // Has a path, but is not a valid data-uri
      expect(res.errors).to.eql(['NO_SCHEME']);
    });

    it('toString (trims)', () => {
      const test = (input: string, output: string) => {
        const res = uri.parse(input);
        expect(res.toString()).to.eql(output);
      };
      test('data:foo', 'data:foo');
      test(' data:foo  ', 'data:foo');
      test('', '');
      test('  ', '');
    });

    it('path depth (*, **)', () => {
      const test = (input: string, suffix: string) => {
        const res = uri.parse(input);
        const path = res.path;
        expect(path.text).to.eql('foo/bar');
        expect(path.suffix).to.eql(suffix);
      };
      test('data:foo/bar', '*');
      test('data:foo/bar/', '*');
      test('data:foo/bar/*', '*');
      test('data:foo/bar/**', '**');
      test('data:foo/bar/***', '**');
      test('data:foo/bar/****************', '**');
    });
  });
});
