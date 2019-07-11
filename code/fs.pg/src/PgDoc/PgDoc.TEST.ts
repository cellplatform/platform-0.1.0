import { expect } from '@platform/test';
import { PgDoc } from '.';

const params = { user: 'dev', host: 'localhost', database: 'test' };
const testDb = () => PgDoc.create({ db: params });

describe('PgDoc', () => {
  describe('lifecycle', () => {
    it('disposal', () => {
      const db = testDb();
      let count = 0;
      db.dispose$.subscribe(() => count++);
      expect(db.isDisposed).to.eql(false);
      db.dispose();
      db.dispose();
      db.dispose();
      expect(count).to.eql(1);
      expect(db.isDisposed).to.eql(true);
    });
  });

  describe('parseKey (static)', () => {
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
