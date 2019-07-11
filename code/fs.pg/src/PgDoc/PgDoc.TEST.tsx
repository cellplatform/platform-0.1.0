import { expect } from 'chai';
import { PgDoc } from '.';
import { pg } from '../common';

const params = { user: 'dev', host: 'localhost', database: 'test' };
const tables = ['FOO', 'BAR', 'BOO'];

const createDb = () => PgDoc.create({ db: params });
const dropTables = async () => {
  const client = new pg.Pool(params);
  const drop = (table: string) => client.query(`DROP TABLE IF EXISTS "${table}"`);
  await Promise.all(tables.map(table => drop(table)));
  client.end();
};

describe('PgDoc (integration)', () => {
  let db: PgDoc = createDb();

  beforeEach(async () => {
    await dropTables();
    db = createDb();
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
});

describe('PgDoc', () => {
  describe('lifecycle', () => {
    it('disposal', () => {
      const db = createDb();
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
