import { expect } from 'chai';
import { PgDoc } from '.';

describe('PgDoc', () => {
  describe('parseKey', () => {
    it('parses the table key ', () => {
      const test = (key: string, expectTable: string, expectPath: string) => {
        const res = PgDoc.parseKey(key);
        expect(res.table).to.eql(expectTable);
        expect(res.path).to.eql(expectPath);
      };

      test('FOO/foo/bar', 'FOO', '/foo/bar');
      test('  FOO/foo/bar  ', 'FOO', '/foo/bar');
      test('/FOO/foo/bar', 'FOO', '/foo/bar');
      test('  /FOO/foo/bar', 'FOO', '/foo/bar');
      test(' ////FOO/foo/bar', 'FOO', '/foo/bar');
      test('FOO/foo', 'FOO', '/foo');
      test('FOO/foo/', 'FOO', '/foo');
      test('FOO/foo///', 'FOO', '/foo');
    });

    it('throws', () => {
      const fail = (key: string) => {
        const fn = () => PgDoc.parseKey(key);
        expect(fn).to.throw();
      };
      fail('');
      fail('  ');
      fail('/');
      fail('/TABLE');
      fail('/TABLE/');
      fail('TABLE/');
      fail('TABLE//foo');
      fail('TABLE/foo//bar');
    });
  });
});
