import { expect } from 'chai';
import { fs, time } from '../common';
import { DocDb } from '..';
import * as t from '../types';

const dir = fs.resolve('./.dev/unit-test');

const testDb = (args: { isMemoized?: boolean } = {}) => {
  const { isMemoized } = args;
  return new DocDb({ dir, cache: isMemoized });
};

describe('DocDb', () => {
  beforeEach(async () => fs.remove(dir));
  afterEach(async () => fs.remove(dir));

  it('creates', () => {
    const db = testDb();
    expect(db.dir).to.eql(dir);
    expect(db.cache.isEnabled).to.eql(false);
  });

  it('dispose', () => {
    const db = testDb();
    let count = 0;
    db.dispose$.subscribe(() => count++);
    expect(db.isDisposed).to.eql(false);

    db.dispose();
    db.dispose();

    expect(db.isDisposed).to.eql(true);
    expect(count).to.eql(1);
  });

  it('get/put', async () => {
    const db = testDb();

    let count = 0;
    const test = async (value?: any) => {
      count++;
      const key = `get-put/foo.${count}`;
      const res = await db.put(key, value);
      expect(res.props.key).to.eql(key);
      expect(res.value).to.eql(value);

      const getStatic = await DocDb.get(dir, key);
      expect(getStatic.props.key).to.eql(key);
      expect(getStatic.value).to.eql(value);
      expect(getStatic.props.exists).to.eql(true);

      const getInstance = await DocDb.get(dir, key);
      expect(getInstance.props.key).to.eql(key);
      expect(getInstance.value).to.eql(value);
      expect(getInstance.props.exists).to.eql(true);
    };

    await test();
    await test(undefined);
    await test(null);
    await test('');
    await test('  ');
    await test('');
    await test(' hello  ');
    await test(123);
    await test(true);
    await test(false);
    await test({});
    await test({ foo: 'hello', count: 123, nothing: null });
    await test([]);
    await test([1, 2, 3]);
    await test(['one', true, { foo: 456 }, 123, ['hello']]);
    await test();
    await test();
  });

  it('get (exists === false)', async () => {
    const db = testDb();
    expect((await db.get('NO_EXIST')).props.exists).to.eql(false);
  });

  it('getValue', async () => {
    const db = testDb();
    expect(await db.getValue('foo')).to.eql(undefined);

    await db.put('foo', 1);
    expect(await db.getValue('foo')).to.eql(1);

    await db.put('foo', { msg: 'hello' });
    expect((await db.getValue<{ msg: string }>('foo')).msg).to.eql('hello');

    expect(await db.getValue('NO_EXIST')).to.eql(undefined);
  });

  it('put (overwrite)', async () => {
    const db = testDb();
    await db.put('foo', 1);
    await db.put('foo', 2);
    const res = await db.get('foo');
    expect(res.value).to.eql(2);
  });

  it('put (timestamps)', async () => {
    const db = testDb();
    const now = time.now.timestamp;
    const res1 = await db.put('foo', { msg: 'hello', createdAt: -1, modifiedAt: -1 });
    const value = res1.value as any;
    expect(value.createdAt).to.be.within(now - 5, now + 20);
    expect(value.modifiedAt).to.be.within(now - 5, now + 20);
  });

  it('delete', async () => {
    const db = testDb();
    const key = 'delete/foo';
    await db.put(key, { msg: 'hello' });
    expect((await db.get(key)).props.exists).to.eql(true);
    const res1 = await db.delete(key);

    expect(res1.props.deleted).to.eql(true);
    expect(res1.props.exists).to.eql(false);

    const res2 = await db.get('delete/foo');
    expect(res2.props.exists).to.eql(false);
  });

  it('deletes twice', async () => {
    const db = testDb();
    const key = 'delete/two';
    await db.put(key, 1);
    expect((await db.get(key)).props.exists).to.eql(true);
    const res1 = await db.delete(key);
    const res2 = await db.delete(key);

    expect(res1.props.deleted).to.eql(true);
    expect(res2.props.deleted).to.eql(false);

    await db.put(key, 2);
    await db.delete(key);
    expect((await db.get(key)).props.exists).to.eql(false);
  });

  it('observable events', async () => {
    const db = testDb();
    const events: t.DocDbActionEvent[] = [];
    db.events$.subscribe(e => events.push(e as t.DocDbActionEvent));

    const key = 'foo/bar';
    await db.get(key);
    await db.put(key, 123);
    await db.get(key);
    await db.delete(key);
    await db.get(key);

    expect(events.length).to.eql(5);

    expect(events[0].type).to.eql('DOC/get');
    expect(events[1].type).to.eql('DOC/put');
    expect(events[2].type).to.eql('DOC/get');
    expect(events[3].type).to.eql('DOC/delete');
    expect(events[4].type).to.eql('DOC/get');

    expect(events[0].payload.value).to.eql(undefined);
    expect(events[1].payload.value).to.eql(123);
    expect(events[2].payload.value).to.eql(123);
    expect(events[3].payload.value).to.eql(123);
    expect(events[4].payload.value).to.eql(undefined);

    const get = events[0] as t.IDocDbGetEvent;
    expect(get.payload.cached).to.eql(false);
  });

  describe('many', () => {
    it('getMany', async () => {
      const db = testDb();

      const res1 = await db.getMany(['foo', 'bar']);
      expect(res1.length).to.eql(2);
      expect(res1[0].value).to.eql(undefined);
      expect(res1[1].value).to.eql(undefined);
      expect(res1[0].props.exists).to.eql(false);
      expect(res1[1].props.exists).to.eql(false);

      await db.put('foo', 1);
      await db.put('bar', 2);
      await db.put('baz', 3);

      const res2 = await db.getMany(['foo', 'bar', 'ZOO']);
      expect(res2.length).to.eql(3);
      expect(res2[0].value).to.eql(1);
      expect(res2[1].value).to.eql(2);
      expect(res2[2].value).to.eql(undefined);
      expect(res2[0].props.exists).to.eql(true);
      expect(res2[1].props.exists).to.eql(true);
      expect(res2[2].props.exists).to.eql(false);
    });

    it('putMany', async () => {
      const db = testDb();
      await db.putMany([{ key: 'foo', value: 10 }, { key: 'bar', value: 20 }]);
      const res = await db.getMany(['foo', 'bar']);
      expect(res.length).to.eql(2);
      expect(res[0].value).to.eql(10);
      expect(res[1].value).to.eql(20);
    });

    it('deleteMany', async () => {
      const db = testDb();
      await db.putMany([{ key: 'foo', value: 100 }, { key: 'bar', value: 200 }]);
      const res1 = await db.deleteMany(['foo', 'bar']);
      expect(res1[0].props.deleted).to.eql(true);
      expect(res1[1].props.deleted).to.eql(true);

      const res2 = await db.getMany(['foo', 'bar']);
      expect(res2.length).to.eql(2);
      expect(res2[0].value).to.eql(undefined);
      expect(res2[1].value).to.eql(undefined);
      expect(res2[0].props.exists).to.eql(false);
      expect(res2[1].props.exists).to.eql(false);
    });
  });

  describe('find (glob)', () => {
    const prepare = async () => {
      const db = testDb();
      await db.put('cell/A1', 1);
      await db.put('cell/A2', 2);
      await db.put('cell/A2/meta', { foo: 123 });
      await db.put('foo', 'hello');
      return db;
    };

    it('no pattern', async () => {
      const db = await prepare();
      const res = await db.find({});
      expect(res.keys).to.eql(['foo', 'cell/A1', 'cell/A2', 'cell/A2/meta']);
      expect(res.map.foo).to.eql('hello');
      expect(res.map['cell/A1']).to.eql(1);
      expect(res.map['cell/A2']).to.eql(2);
      expect(res.map['cell/A2/meta']).to.eql({ foo: 123 });
    });

    it('pattern (deep, default)', async () => {
      const db = await prepare();
      const res: any = await db.find({ pattern: 'cell' });
      expect(res.keys).to.eql(['cell/A1', 'cell/A2', 'cell/A2/meta']);
      expect(res.map['cell/A1']).to.eql(1);
      expect(res.map['cell/A2']).to.eql(2);
      expect(res.map['cell/A2/meta']).to.eql({ foo: 123 });
    });

    it('pattern (string parameter, deep/default)', async () => {
      const db = await prepare();
      const res: any = await db.find('cell');
      expect(res.keys).to.eql(['cell/A1', 'cell/A2', 'cell/A2/meta']);
      expect(res.map['cell/A1']).to.eql(1);
      expect(res.map['cell/A2']).to.eql(2);
      expect(res.map['cell/A2/meta']).to.eql({ foo: 123 });
    });

    it('pattern (not deep)', async () => {
      const db = await prepare();
      const res: any = await db.find({ pattern: 'cell', deep: false });
      expect(res.keys).to.eql(['cell/A1', 'cell/A2']);
      expect(res.map['cell/A1']).to.eql(1);
      expect(res.map['cell/A2']).to.eql(2);
    });

    it('no match', async () => {
      const db = await prepare();
      const res: any = await db.find({ pattern: 'YO' });
      expect(res.keys).to.eql([]);
      expect(res.list).to.eql([]);
      expect(res.map).to.eql({});
    });
  });

  describe('caching (memoize)', () => {
    it('creates memoized', () => {
      const db1 = testDb({});
      const db2 = testDb({ isMemoized: true });
      expect(db1.cache.isEnabled).to.eql(false);
      expect(db2.cache.isEnabled).to.eql(true);
    });

    it('puts value in cache on get', async () => {
      const db = testDb({ isMemoized: true });
      expect(db.cache.values).to.eql({});

      await db.put('foo', 1);
      expect(db.cache.values).to.eql({});

      await db.get('foo');
      expect(db.cache.values.foo.value).to.eql(1);
    });

    it('reads from cache value', async () => {
      const db = testDb({ isMemoized: true });
      await db.put('foo', 1);

      const res1 = await db.getValue('foo');
      expect(res1).to.eql(1);

      db.cache.values.foo.value = 2; // Fake out the cache value.

      const res2 = await db.getValue('foo');
      expect(res2).to.eql(2);
    });

    it('invalidates cache on put', async () => {
      const db = testDb({ isMemoized: true });

      await db.put('foo', 1);
      await db.put('bar', 'hello');

      expect(await db.getValue('foo')).to.eql(1);
      expect(await db.getValue('bar')).to.eql('hello');

      await db.put('foo', 2);
      expect(await db.getValue('foo')).to.eql(2);

      expect(db.cache.values.foo.value).to.eql(2);
      expect(db.cache.values.bar.value).to.eql('hello');
    });

    it('observable events (while caching)', async () => {
      const db = testDb({ isMemoized: true });
      const events: t.DocDbEvent[] = [];
      db.events$.subscribe(e => events.push(e));

      const key = 'foo/bar';
      await db.put(key, 123);
      await db.get(key);
      await db.get(key);
      await db.put(key, 456);

      expect(events.length).to.eql(5);

      expect(events[0].type).to.eql('DOC/put');
      expect(events[1].type).to.eql('DOC/get');
      expect(events[2].type).to.eql('DOC/get');
      expect(events[3].type).to.eql('DOC/put');
      expect(events[4].type).to.eql('DOC/cache/removed');

      const get1 = events[1] as t.IDocDbGetEvent;
      const get2 = events[2] as t.IDocDbGetEvent;

      expect(get1.payload.cached).to.eql(false);
      expect(get2.payload.cached).to.eql(true);
    });
  });
});
