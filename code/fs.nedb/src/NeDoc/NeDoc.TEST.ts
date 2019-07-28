import { expect, fs, time, t } from '../test';
import { NeDoc } from '.';

const dir = fs.resolve('tmp/NeDoc');
const removeDir = () => fs.remove(dir);

/**
 * NOTE:  Filename is incremented to avoid NEDB internal error
 *        when working with multiple instances of the same file-name.
 *        See: https://github.com/louischatriot/nedb/issues/462
 */
let count = 0;
const getFilename = () => fs.join(dir, `file-${count++}.db`);

describe('NeDoc', () => {
  let db: NeDoc;

  beforeEach(async () => (db = await NeDoc.create()));
  afterEach(() => db.dispose());
  after(async () => removeDir());

  it('constructs', () => {
    const db = NeDoc.create();
    expect(db).to.be.an.instanceof(NeDoc);
  });

  it('strips "nedb:" prefix from filename', () => {
    const filename = getFilename();
    const db = NeDoc.create({ filename: `nedb:${filename}` });
    const text = db.toString();
    expect(text).to.not.include('nedb:');
  });

  it('toString', () => {
    const filename = getFilename();
    const db1 = NeDoc.create();
    const db2 = NeDoc.create({ filename });

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

  describe('find (path)', () => {
    it('nothing (no match)', async () => {
      const items = [
        { key: 'cell/A1', value: 123 },
        { key: 'cell/A2', value: 456 },
        { key: 'cell/A2/meta', value: { msg: 'hello' } },
      ];
      await db.putMany(items);

      const test = async (query: string) => {
        const res = await db.find(query);
        expect(res.length).to.eql(0);
        expect(res.list).to.eql([]);
      };
      await test('BOO');
      await test('BAR');
      await test('');
    });

    it('shallow ("cell/*")', async () => {
      const items = [
        { key: 'cell/A1', value: 123 },
        { key: 'cell/A2', value: 456 },
        { key: 'cell/A2/meta', value: { msg: 'hello' } },
      ];
      await db.putMany(items);

      const test = async (query: string) => {
        const res = await db.find(query);
        expect(res.length).to.eql(2);
        const values = res.list.map(item => item.value);
        expect(values.includes(123)).to.eql(true);
        expect(values.includes(456)).to.eql(true);
      };
      await test('cell');
      await test('cell/');
      await test('cell/*');
    });

    it('deep ("cell/**")', async () => {
      const items = [
        { key: 'cell/A1', value: 123 },
        { key: 'cell/A2', value: 456 },
        { key: 'cell/A2/meta', value: 'meta' },
        { key: 'foo', value: 'boo' },
      ];
      await db.putMany(items);

      const res = await db.find('cell/**');
      expect(res.length).to.eql(3);

      const values = res.list.map(item => item.value);
      expect(values.includes(123)).to.eql(true);
      expect(values.includes(456)).to.eql(true);
      expect(values.includes('meta')).to.eql(true);
      expect(values.includes('boo')).to.eql(false);
    });

    it('deep: entire database (**)', async () => {
      const items = [
        { key: 'cell/A1', value: 123 },
        { key: 'cell/A2', value: 456 },
        { key: 'cell/A2/meta', value: 'meta' },
        { key: 'foo', value: 'boo' },
      ];
      await db.putMany(items);
      const res = await db.find('**');
      expect(res.length).to.eql(5); // NB: 5 (not 4) because results include the system timestamps.
    });

    it('shallow: root documents (*)', async () => {
      const items = [
        { key: 'foo', value: 'foo' },
        { key: 'cell/A1', value: 123 },
        { key: 'bar', value: 'bar' },
      ];
      await db.putMany(items);
      const res = await db.find('*');

      expect(res.length).to.eql(2);
      expect(res.keys.includes('foo')).to.eql(true);
      expect(res.keys.includes('bar')).to.eql(true);

      const values = res.list.map(item => item.value);
      expect(values.includes('foo')).to.eql(true);
      expect(values.includes('bar')).to.eql(true);
    });
  });

  describe('find (path + filter)', () => {
    const items = [
      { key: 'cell/A1', value: { count: 1 } },
      { key: 'cell/A2', value: { count: 2 } },
      { key: 'column/A', value: { count: 3 } },
      { key: 'foo', value: { obj: { msg: 'hello' } } },
    ];

    beforeEach(() => db.putMany(items));

    it('filters on path all docs', async () => {
      const res = await db.find({ path: '**', filter: { count: { $gte: 2 } } });
      expect(res.length).to.eql(2);
      expect(res.keys).to.include('cell/A2');
      expect(res.keys).to.include('column/A');
    });

    it('filters only on path matched docs', async () => {
      const res = await db.find({ path: 'cell/*', filter: { count: { $gte: 2 } } });
      expect(res.keys).to.eql(['cell/A2']);
    });

    describe('equality', () => {
      it('equals', async () => {
        const res = await db.find({ path: '**', filter: { count: 2 } });
        expect(res.keys).to.eql(['cell/A2']);
      });

      it('not-equals', async () => {
        const res = await db.find({ path: '**', filter: { count: { $ne: 2 } } });
        expect(res.keys).to.include('cell/A1');
        expect(res.keys).to.include('column/A');
        expect(res.keys).to.not.include('cell/A2');
      });
    });

    describe('greater-than / less-than', () => {
      it('gt', async () => {
        const res = await db.find({ path: '**', filter: { count: { $gt: 1 } } });
        expect(res.length).to.eql(2);
        expect(res.keys).to.include('cell/A2');
        expect(res.keys).to.include('column/A');
      });

      it('gte', async () => {
        const res = await db.find({ path: '**', filter: { count: { $gte: 2 } } });
        expect(res.length).to.eql(2);
        expect(res.keys).to.include('cell/A2');
        expect(res.keys).to.include('column/A');
      });

      it('lt', async () => {
        const res = await db.find({ path: '**', filter: { count: { $lt: 2 } } });
        expect(res.keys).to.eql(['cell/A1']);
      });

      it('lte', async () => {
        const res = await db.find({ path: '**', filter: { count: { $lte: 2 } } });
        expect(res.length).to.eql(2);
        expect(res.keys).to.include('cell/A1');
        expect(res.keys).to.include('cell/A2');
      });
    });
  });

  it('observable events', async () => {
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

    expect(events[0].payload.action).to.eql('get');
    expect(events[1].payload.action).to.eql('put');
    expect(events[2].payload.action).to.eql('get');
    expect(events[3].payload.action).to.eql('delete');
    expect(events[4].payload.action).to.eql('get');

    expect(events[0].payload.value).to.eql(undefined);
    expect(events[1].payload.value).to.eql(123);
    expect(events[2].payload.value).to.eql(123);
    expect(events[3].payload.value).to.eql(undefined);
    expect(events[4].payload.value).to.eql(undefined);
  });

  describe('system fields (SYS)', () => {
    describe('timestamps', () => {
      it('timestamps are -1 by default (prior to initial write)', async () => {
        expect(await db.sys.timestamps()).to.eql({ createdAt: -1, modifiedAt: -1 });
      });

      it('increments timestamps ', async () => {
        const now = time.now.timestamp;

        const res1 = await db.sys.increment();
        const ts1 = await db.sys.timestamps();
        expect(ts1).to.eql(res1);
        expect(ts1.createdAt).to.be.within(now - 5, now + 10);
        expect(ts1.modifiedAt).to.eql(ts1.createdAt);

        await time.wait(50);

        const res2 = await db.sys.increment();
        const ts2 = await db.sys.timestamps();
        expect(ts2).to.eql(res2);
        expect(ts2.createdAt).to.eql(ts1.createdAt);
        expect(ts2.modifiedAt).to.be.within(now - 45, now + 60);
      });

      it('increments timestamps on put', async () => {
        const now = time.now.timestamp;

        const ts0 = await db.sys.timestamps();
        expect(ts0.createdAt).to.eql(-1);
        expect(ts0.modifiedAt).to.eql(-1);

        await db.put('foo', 123);
        const ts1 = await db.sys.timestamps();
        expect(ts1.createdAt).to.be.within(now - 5, now + 10);
        expect(ts1.modifiedAt).to.eql(ts1.createdAt);

        await time.wait(50);
        await db.putMany([{ key: 'foo', value: 456 }, { key: 'bar', value: 789 }]);

        const ts2 = await db.sys.timestamps();
        expect(ts2.createdAt).to.eql(ts1.createdAt);
        expect(ts2.modifiedAt).to.be.within(now - 45, now + 60);

        const res = await db.find('**');
        const ts3 = res.list.find(item => item.props.key === '~sys/timestamps');

        expect(ts3 && ts3.value).to.eql(true);
        expect(ts3 && ts3.props.createdAt).to.eql(ts2.createdAt);
        expect(ts3 && ts3.props.modifiedAt).to.eql(ts2.modifiedAt);
      });
    });
  });
});
