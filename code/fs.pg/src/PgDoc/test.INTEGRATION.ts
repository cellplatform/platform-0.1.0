import { PgDoc } from '.';
import { time } from '../common';
import test, { expect } from '../test';

const dropTables = async () => {
  const tables = ['FOO', 'BAR', 'BOO'];
  await test.dropTables(tables);
};

describe('PgDoc (integration)', () => {
  let db: PgDoc = test.db();

  beforeEach(async () => {
    await dropTables();
    db = test.db();
  });
  afterEach(() => db.dispose());

  it('get (not exist)', async () => {
    const key = 'NO_EXIST/foo';
    const res = await db.get(key);

    expect(res.value).to.eql(undefined);
    expect(res.props.exists).to.eql(false);
    expect(await db.getValue(key)).to.eql(undefined);
  });

  it('put (escaped \' character)', async () => {
    const key = 'FOO/char';
    const msg = `'"?<>\`~:\\/!@#$%^&*()_-+=`;
    await db.put(key, { msg });
    const res = await db.getValue<{ msg: string }>(key);
    expect(res.msg).to.eql(msg);
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

  it('put => timestamps (implicit)', async () => {
    const key = 'FOO/bar';
    const res1 = await db.get(key);

    expect(res1.value).to.eql(undefined);
    expect(res1.props.exists).to.eql(false);
    expect(res1.props.createdAt).to.eql(-1);
    expect(res1.props.modifiedAt).to.eql(-1);

    const now = time.now.timestamp;
    const res2 = await db.put(key, 123);
    expect(res2.props.createdAt).to.be.within(now - 5, now + 20);
    expect(res2.props.modifiedAt).to.be.within(now - 5, now + 20);

    const res3 = await db.get(key);
    expect(res3.props.createdAt).to.eql(res2.props.createdAt);
    expect(res3.props.modifiedAt).to.eql(res2.props.modifiedAt);

    await time.wait(100);
    const res4 = await db.put(key, 456);
    expect(res4.props.createdAt).to.eql(res2.props.createdAt);
    expect(res4.props.modifiedAt).to.be.within(now + 90, now + 120);
  });

  it('put (custom timestamps)', async () => {
    const key = 'FOO/bar';

    const res1 = await db.put(key, 'hello', { createdAt: 123, modifiedAt: 456 });
    expect(res1.props.createdAt).to.eql(123);
    expect(res1.props.modifiedAt).to.eql(456);

    const res2 = await db.get(key);
    expect(res2.props.createdAt).to.eql(123);
    expect(res2.props.modifiedAt).to.eql(456);
  });

  it('putMany (custom timestamps)', async () => {
    const key = 'FOO/bar';
    const res1 = await db.putMany([{ key, value: 'hello', createdAt: 123, modifiedAt: 456 }]);
    expect(res1[0].props.createdAt).to.eql(123);
    expect(res1[0].props.modifiedAt).to.eql(456);

    const res2 = await db.get(key);
    expect(res2.props.createdAt).to.eql(123);
    expect(res2.props.modifiedAt).to.eql(456);
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
      const db = test.db();
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
      const res = await db.find({});
      expect(res.length).to.eql(0);
      expect(res.error && res.error.message).to.include('must contain at least a root TABLE name');
    });

    it('no path (deep)', async () => {
      const now = time.now.timestamp;
      const db = await prepare();
      const res = await db.find({ path: 'FOO/**' });
      expect(res.error).to.eql(undefined);
      expect(res.length).to.eql(4);
      expect(res.keys).to.eql(['FOO/cell/A1', 'FOO/cell/A2', 'FOO/cell/A2/meta', 'FOO/bar']);
      expect(res.map['FOO/bar']).to.eql('hello');
      expect(res.map['FOO/cell/A1']).to.eql(1);
      expect(res.map['FOO/cell/A2']).to.eql(2);
      expect(res.map['FOO/cell/A2/meta']).to.eql({ foo: 123 });

      const A1 = res.list[0];
      expect(A1.props.createdAt).to.be.within(now - 5, now + 30);
      expect(A1.props.modifiedAt).to.be.within(now - 5, now + 30);
    });

    it('path (deep)', async () => {
      const db = await prepare();
      const res = await db.find({ path: 'FOO/cell/**' });
      expect(res.error).to.eql(undefined);
      expect(res.length).to.eql(3);
      expect(res.keys).to.eql(['FOO/cell/A1', 'FOO/cell/A2', 'FOO/cell/A2/meta']);
      expect(res.map['FOO/cell/A1']).to.eql(1);
      expect(res.map['FOO/cell/A2']).to.eql(2);
      expect(res.map['FOO/cell/A2/meta']).to.eql({ foo: 123 });
    });

    it('path (parameter as string, deep/default)', async () => {
      const db = await prepare();
      const res = await db.find('FOO/cell/**');
      expect(res.error).to.eql(undefined);
      expect(res.length).to.eql(3);
      expect(res.keys).to.eql(['FOO/cell/A1', 'FOO/cell/A2', 'FOO/cell/A2/meta']);
      expect(res.map['FOO/cell/A1']).to.eql(1);
      expect(res.map['FOO/cell/A2']).to.eql(2);
      expect(res.map['FOO/cell/A2/meta']).to.eql({ foo: 123 });
      expect(res.error).to.eql(undefined);
    });

    it('path (shallow)', async () => {
      const db = await prepare();
      const res = await db.find({ path: 'FOO/cell' });
      expect(res.error).to.eql(undefined);
      expect(res.length).to.eql(2);
      expect(res.keys).to.eql(['FOO/cell/A1', 'FOO/cell/A2']);
      expect(res.map['FOO/cell/A1']).to.eql(1);
      expect(res.map['FOO/cell/A2']).to.eql(2);
      expect(res.error).to.eql(undefined);
    });

    it('no match', async () => {
      const db = await prepare();
      const res = await db.find({ path: 'FOO/yo' });
      expect(res.error).to.eql(undefined);
      expect(res.length).to.eql(0);
      expect(res.keys).to.eql([]);
      expect(res.list).to.eql([]);
      expect(res.map).to.eql({});
      expect(res.error).to.eql(undefined);
    });

    it('no table (error)', async () => {
      await dropTables();
      const res = await db.find({ path: 'FOO/yo' });
      const error = res.error;
      expect(res.length).to.eql(0);
      expect(error && error.message).to.includes('relation "FOO" does not exist');
    });
  });
});
