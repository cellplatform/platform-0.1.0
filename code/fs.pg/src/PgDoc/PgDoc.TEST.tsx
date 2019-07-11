import { expect, expectError } from '@platform/test';
import { PgDoc } from '.';
import { pg } from '../common';

const params = { user: 'dev', host: 'localhost', database: 'test' };
const tables = ['FOO', 'BAR', 'BOO'];

const testDb = () => PgDoc.create({ db: params });
const dropTables = async () => {
  const client = new pg.Pool(params);
  const drop = (table: string) => client.query(`DROP TABLE IF EXISTS "${table}"`);
  await Promise.all(tables.map(table => drop(table)));
  client.end();
};

describe('PgDoc (integration)', () => {
  let db: PgDoc = testDb();

  beforeEach(async () => {
    await dropTables();
    db = testDb();
  });
  afterEach(() => db.dispose());

  it('get (not exist)', async () => {
    const key = 'NO_EXIST/foo';
    const res = await db.get(key);

    expect(res.value).to.eql(undefined);
    expect(res.props.exists).to.eql(false);
    expect(await db.getValue(key)).to.eql(undefined);
  });

  it('put => get (props)', async () => {
    const key = 'FOO/bar';
    const res1 = await db.get(key);
    expect(res1.value).to.eql(undefined);
    expect(res1.props.exists).to.eql(false);
    expect(res1.props.key).to.eql(key);

    const obj = { msg: 'hello', count: 123 };
    const res2 = await db.put(key, obj);

    expect(res2.value).to.eql(obj);
    expect(res2.props.exists).to.eql(true);
    expect(res2.props.key).to.eql(key);

    const res3 = await db.get(key);
    expect(res3).to.eql(res2);

    await db.put(key, 456); // NB: Upsert (replace value).
    const res4 = await db.get(key);
    expect(res4.value).to.eql(456);

    await db.put(key, undefined);
    const res5 = await db.get(key);
    expect(res5.value).to.eql(undefined);
  });

  it('put => getValue (types)', async () => {
    const key = 'FOO/bar';
    expect(await db.getValue(key)).to.eql(undefined);

    const test = async (value: any) => {
      await db.put(key, value);
      expect(await db.getValue(key)).to.eql(value);
    };

    await test(undefined);
    await test(null);
    await test(123);
    await test(true);
    await test(false);
    await test('');
    await test('  ');
    await test('hello');
    await test({});
    await test({ count: 123, msg: 'hello', list: [1, 2, 3], flag: true });
    await test([]);
    await test([1, 'two', { name: 'three' }]);
  });

  it('putMany => getMany', async () => {
    const items = [{ key: 'FOO/1', value: 123 }, { key: 'FOO/2', value: 456 }];
    const keys = items.map(item => item.key);

    const res1 = await db.getMany(keys);
    expect(res1[0].value).to.eql(undefined);
    expect(res1[0].props.exists).to.eql(false);
    expect(res1[1].value).to.eql(undefined);
    expect(res1[1].props.exists).to.eql(false);

    await db.putMany(items);
    const res2 = await db.getMany(keys);
    expect(res2[0].value).to.eql(123);
    expect(res2[0].props.exists).to.eql(true);
    expect(res2[1].value).to.eql(456);
    expect(res2[1].props.exists).to.eql(true);
  });

  it('put => delete', async () => {
    const key = 'FOO/bar';
    await db.put(key, 123);

    const res1 = await db.get(key);
    expect(res1.value).to.eql(123);
    expect(res1.props.exists).to.eql(true);

    const res2 = await db.delete(key);
    expect(res2.value).to.eql(undefined);
    expect(res2.props.exists).to.eql(false);

    const res3 = await db.get(key);
    expect(res3.value).to.eql(undefined);
    expect(res3.props.exists).to.eql(false);
  });

  it('putMany => deleteMany', async () => {
    const items = [{ key: 'FOO/1', value: 123 }, { key: 'FOO/2', value: 456 }];
    const keys = items.map(item => item.key);

    await db.putMany(items);
    const res1 = await db.getMany(keys);
    expect(res1[0].value).to.eql(123);
    expect(res1[0].props.exists).to.eql(true);
    expect(res1[1].value).to.eql(456);
    expect(res1[1].props.exists).to.eql(true);

    const res2 = await db.deleteMany([...keys, 'NO_EXIST/foo']);
    expect(res2[0].value).to.eql(undefined);
    expect(res2[0].props.exists).to.eql(false);
    expect(res2[1].value).to.eql(undefined);
    expect(res2[1].props.exists).to.eql(false);

    const res3 = await db.getMany(keys);
    expect(res3[0].value).to.eql(undefined);
    expect(res3[0].props.exists).to.eql(false);
    expect(res3[1].value).to.eql(undefined);
    expect(res3[1].props.exists).to.eql(false);
  });

  describe('find', () => {
    const prepare = async () => {
      const db = testDb();
      await db.put('FOO/cell/A1', 1);
      await db.put('FOO/cell/A2', 2);
      await db.put('FOO/cell/A2/meta', { foo: 123 });
      await db.put('FOO/bar', 'hello');
      await db.put('BAR/1', 1);
      await db.put('BAR/2', 2);
      return db;
    };

    it('no pattern (throws)', async () => {
      const db = await prepare();
      expectError(() => db.find({}));
    });

    it('no path (deep, default)', async () => {
      const db = await prepare();
      const res = await db.find({ pattern: 'FOO' });
      expect(res.keys).to.eql(['FOO/cell/A1', 'FOO/cell/A2', 'FOO/cell/A2/meta', 'FOO/bar']);
      expect(res.map['FOO/bar']).to.eql('hello');
      expect(res.map['FOO/cell/A1']).to.eql(1);
      expect(res.map['FOO/cell/A2']).to.eql(2);
      expect(res.map['FOO/cell/A2/meta']).to.eql({ foo: 123 });
    });

    it('path (deep, default)', async () => {
      const db = await prepare();
      const res = await db.find({ pattern: 'FOO/cell' });
      expect(res.keys).to.eql(['FOO/cell/A1', 'FOO/cell/A2', 'FOO/cell/A2/meta']);
      expect(res.map['FOO/cell/A1']).to.eql(1);
      expect(res.map['FOO/cell/A2']).to.eql(2);
      expect(res.map['FOO/cell/A2/meta']).to.eql({ foo: 123 });
    });

    it('path (parameter as string, deep/default)', async () => {
      const db = await prepare();
      const res = await db.find('FOO/cell');
      expect(res.keys).to.eql(['FOO/cell/A1', 'FOO/cell/A2', 'FOO/cell/A2/meta']);
      expect(res.map['FOO/cell/A1']).to.eql(1);
      expect(res.map['FOO/cell/A2']).to.eql(2);
      expect(res.map['FOO/cell/A2/meta']).to.eql({ foo: 123 });
    });

    it('path (not deep)', async () => {
      const db = await prepare();
      const res = await db.find({ pattern: 'FOO/cell', deep: false });
      expect(res.keys).to.eql(['FOO/cell/A1', 'FOO/cell/A2']);
      expect(res.map['FOO/cell/A1']).to.eql(1);
      expect(res.map['FOO/cell/A2']).to.eql(2);
    });

    it('no match', async () => {
      const db = await prepare();
      const res = await db.find({ pattern: 'FOO/yo' });
      expect(res.keys).to.eql([]);
      expect(res.list).to.eql([]);
      expect(res.map).to.eql({});
    });
  });
});

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
