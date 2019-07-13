import { expect } from 'chai';
import { fs, time } from '../common';
import { FileDb, FileDbSchema } from '..';
import * as t from '../types';

const dir = 'tmp/db';
// after(async () => fs.remove('tmp'));

const testDb = (args: { cache?: boolean; schema?: t.IFileDbSchema } = {}) => {
  const { cache, schema } = args;
  return FileDb.create({ dir, cache, schema });
};

describe('FileDb', () => {
  beforeEach(async () => fs.remove(dir));
  // afterEach(async () => fs.remove(dir));

  describe('lifecycle', () => {
    it('creates', () => {
      const db = testDb();
      expect(db.cache.isEnabled).to.eql(false);
      expect(db.dir).to.eql(fs.resolve(dir));
    });

    it('has default schema', () => {
      const db = testDb();
      expect(db.schema).to.eql(FileDbSchema.DEFAULT);
    });

    it('has custom schema', () => {
      const schema: t.IFileDbSchema = { paths: { cell: { file: 'sheet' } } };
      const db = testDb({ schema });
      expect(db.schema).to.eql(schema);
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

      // const getStatic = await FileDb.get(dir, key);
      // expect(getStatic.props.key).to.eql(key);
      // expect(getStatic.value).to.eql(value);
      // expect(getStatic.props.exists).to.eql(true);

      const getInstance = await db.get(key);
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

  it('put (value timestamps)', async () => {
    const db = testDb();
    const now = time.now.timestamp;
    const res1 = await db.put('foo', { msg: 'hello', createdAt: -1, modifiedAt: -1 });
    const value = res1.value as any;
    expect(value.createdAt).to.be.within(now - 5, now + 20);
    expect(value.modifiedAt).to.be.within(now - 5, now + 20);
  });

  it('timestamps (implicit)', async () => {
    const db = testDb();
    const key = 'foo';
    const res1 = await db.get(key);

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
    const db = testDb();
    const key = 'FOO/bar';

    const res1 = await db.put(key, 'hello', { createdAt: 123, modifiedAt: 456 });
    expect(res1.props.createdAt).to.eql(123);
    expect(res1.props.modifiedAt).to.eql(456);

    const res2 = await db.get(key);
    expect(res2.props.createdAt).to.eql(123);
    expect(res2.props.modifiedAt).to.eql(456);
  });

  it('putMany (custom timestamps)', async () => {
    const db = testDb();
    const key = 'FOO/bar';
    const res1 = await db.putMany([{ key, value: 'hello', createdAt: 123, modifiedAt: 456 }]);
    expect(res1[0].props.createdAt).to.eql(123);
    expect(res1[0].props.modifiedAt).to.eql(456);

    const res2 = await db.get(key);
    expect(res2.props.createdAt).to.eql(123);
    expect(res2.props.modifiedAt).to.eql(456);
  });

  it('delete', async () => {
    const db = testDb();
    const key = 'delete/foo';
    await db.put(key, { msg: 'hello' });
    expect((await db.get(key)).props.exists).to.eql(true);

    const res1 = await db.delete(key);
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

    expect(res1.value).to.eql(undefined);
    expect(res2.value).to.eql(undefined);

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

    expect(events[0].type).to.eql('DOC/read');
    expect(events[1].type).to.eql('DOC/change');
    expect(events[2].type).to.eql('DOC/read');
    expect(events[3].type).to.eql('DOC/change');
    expect(events[4].type).to.eql('DOC/read');

    expect(events[0].payload.value).to.eql(undefined);
    expect(events[1].payload.value).to.eql(123);
    expect(events[2].payload.value).to.eql(123);
    expect(events[3].payload.value).to.eql(undefined);
    expect(events[4].payload.value).to.eql(undefined);
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
      const res0 = await db.getMany(['foo', 'bar']);
      expect(res0[0].props.exists).to.eql(true);
      expect(res0[1].props.exists).to.eql(true);

      const res1 = await db.deleteMany(['foo', 'bar']);
      expect(res1[0].props.exists).to.eql(false);
      expect(res1[1].props.exists).to.eql(false);

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
      expect(res.length).to.eql(4);
      expect(res.keys).to.eql(['foo', 'cell/A1', 'cell/A2', 'cell/A2/meta']);
      expect(res.map['cell/A1']).to.eql(1);
      expect(res.map['cell/A2']).to.eql(2);
      expect(res.map['cell/A2/meta']).to.eql({ foo: 123 });
      expect(res.map.foo).to.eql('hello');
      expect(res.error).to.eql(undefined);
    });

    it('pattern (deep, default)', async () => {
      const db = await prepare();
      const res: any = await db.find({ pattern: 'cell' });
      expect(res.length).to.eql(3);
      expect(res.keys).to.eql(['cell/A1', 'cell/A2', 'cell/A2/meta']);
      expect(res.map['cell/A1']).to.eql(1);
      expect(res.map['cell/A2']).to.eql(2);
      expect(res.map['cell/A2/meta']).to.eql({ foo: 123 });
      expect(res.error).to.eql(undefined);
    });

    it('pattern (parameter as string, deep/default)', async () => {
      const db = await prepare();
      const res: any = await db.find('cell');
      expect(res.length).to.eql(3);
      expect(res.keys).to.eql(['cell/A1', 'cell/A2', 'cell/A2/meta']);
      expect(res.map['cell/A1']).to.eql(1);
      expect(res.map['cell/A2']).to.eql(2);
      expect(res.map['cell/A2/meta']).to.eql({ foo: 123 });
      expect(res.error).to.eql(undefined);
    });

    it('pattern (not deep)', async () => {
      const db = await prepare();
      const res: any = await db.find({ pattern: 'cell', deep: false });
      expect(res.length).to.eql(2);
      expect(res.keys).to.eql(['cell/A1', 'cell/A2']);
      expect(res.map['cell/A1']).to.eql(1);
      expect(res.map['cell/A2']).to.eql(2);
      expect(res.error).to.eql(undefined);
    });

    it('no match', async () => {
      const db = await prepare();
      const res: any = await db.find({ pattern: 'YO' });
      expect(res.length).to.eql(0);
      expect(res.keys).to.eql([]);
      expect(res.list).to.eql([]);
      expect(res.map).to.eql({});
      expect(res.error).to.eql(undefined);
    });
  });

  describe('caching (memoize)', () => {
    it('creates memoized', () => {
      const db1 = testDb({});
      const db2 = testDb({ cache: true });
      expect(db1.cache.isEnabled).to.eql(false);
      expect(db2.cache.isEnabled).to.eql(true);
    });

    it('puts value in cache on get', async () => {
      const db = testDb({ cache: true });
      expect(db.cache.values).to.eql({});

      await db.put('foo', 1);
      expect(db.cache.values).to.eql({});

      await db.get('foo');
      expect(db.cache.values.foo.value).to.eql(1);
    });

    it('reads from cache value', async () => {
      const db = testDb({ cache: true });
      await db.put('foo', 1);

      const res1 = await db.getValue('foo');
      expect(res1).to.eql(1);

      db.cache.values.foo.value = 2; // Fake out the cache value.

      const res2 = await db.getValue('foo');
      expect(res2).to.eql(2);
    });

    it('invalidates cache on put', async () => {
      const db = testDb({ cache: true });

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
      const db = testDb({ cache: true });
      const events: t.DbEvent[] = [];
      db.events$.subscribe(e => events.push(e));

      const key = 'foo/bar';
      await db.put(key, 123);
      await db.get(key);
      await db.get(key);
      await db.put(key, 456);

      expect(events.length).to.eql(5);

      expect(events[0].type).to.eql('DOC/change');
      expect(events[1].type).to.eql('DOC/read');
      expect(events[2].type).to.eql('DOC/read');
      expect(events[3].type).to.eql('DOC/change');

      expect(events[4].type).to.eql('DOC/cache');
      expect(events[4].payload.action).to.eql('REMOVED');
    });
  });

  describe('schema (key mapping to single file)', () => {
    it('collapsed namespace to single file', async () => {
      const schema: t.IFileDbSchema = {
        paths: {
          cell: { file: 'sheet' },
          column: { file: 'meta' },
          row: { file: 'meta' },
        },
      };

      const db = testDb({ schema });
      await db.put('foo', 123);

      await db.putMany([
        { key: 'cell/A1', value: 1 },
        { key: 'cell/A2', value: 2 },
        { key: 'cell/A3', value: 3 },
        { key: 'cell/A3/meta', value: { info: 456 } },
        { key: 'column/A', value: 120 },
        { key: 'row/0', value: 50 },
      ]);

      const foo = await db.getValue('foo');
      const A1 = await db.getValue('cell/A1');
      const A2 = await db.getValue('cell/A2');
      const A3 = await db.getValue('cell/A3');
      const column = await db.getValue('column/A');
      const row = await db.getValue('row/0');

      expect(foo).to.eql(123);
      expect(A1).to.eql(1);
      expect(A2).to.eql(2);
      expect(A3).to.eql(3);
      expect(column).to.eql(120);
      expect(row).to.eql(50);

      const cells = await db.find('cell'); // NB: not found, because schema maps to different file.
      const sheet = await db.find('sheet');

      expect(cells.keys).to.eql([]);
      expect(sheet.keys).to.eql(['cell/A1', 'cell/A2', 'cell/A3', 'cell/A3/meta']);
    });
  });
});
