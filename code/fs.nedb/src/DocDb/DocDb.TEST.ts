import { expect, fs, time } from '../../test/test';
import { DocDb } from '.';

const dir = fs.resolve('tmp/doc');
const filename = fs.join(dir, 'file.db');
const removeDir = () => fs.remove(dir);

describe('DocDb', () => {
  let db: DocDb;

  beforeEach(async () => {
    db = DocDb.create();
  });
  afterEach(() => db.dispose());

  it('constructs', () => {
    const db = DocDb.create();
    expect(db).to.be.an.instanceof(DocDb);
  });

  it('toString', () => {
    const db1 = DocDb.create();
    const db2 = DocDb.create({ filename });

    expect(db1.toString()).to.eql('[db:memory]');
    expect(db2.toString()).to.include(filename);
  });

  it('get (not exist)', async () => {
    const key = 'NO_EXIST/foo';
    const res = await db.get(key);

    expect(res.value).to.eql(undefined);
    expect(res.props.exists).to.eql(false);
    expect(await db.getValue(key)).to.eql(undefined);
  });

  it('put (escaped characters)', async () => {
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

  it.skip('find', async () => {
    // TEMP 🐷 TODO find
  });
});
