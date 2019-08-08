import { NedbStore } from '.';
import { expect, expectError, fs } from '../test';

const dir = fs.resolve('tmp/store');
const removeDir = () => fs.remove(dir);

/**
 * NOTE:  Filename is incremented to avoid NEDB internal error
 *        when working with multiple instances of the same file-name.
 *        See: https://github.com/louischatriot/nedb/issues/462
 */
let count = 0;
const getFilename = () => fs.join(dir, `file-${count++}.db`);

describe('Store (nedb)', () => {
  beforeEach(async () => removeDir());
  after(async () => removeDir());

  it('constructs', () => {
    const db = NedbStore.create({});
    expect(db).to.be.an.instanceof(NedbStore);
  });

  it('creates with filename', () => {
    const filename = getFilename();
    const db = NedbStore.create({ filename });
    expect(db.filename).to.eql(filename);
  });

  it('strips "nedb:" prefix from filename', () => {
    const filename = getFilename();
    const db = NedbStore.create({ filename: `nedb:${filename}` });
    const text = db.filename;
    expect(text).to.not.include('nedb:');
  });

  it('inserts a single document', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = NedbStore.create<MyDoc>({});

    const res1 = await db.find({ name: 'foo' });
    expect(res1).to.eql([]);

    const res2 = await db.insert({ name: 'foo' });
    expect(res2.name).to.eql('foo');

    const res3 = await db.find({});
    expect(res3.length).to.eql(1);
    expect(res3[0].name).to.eql('foo');

    const res4 = await db.findOne({ name: 'foo' });
    expect(res4.name).to.eql('foo');
  });

  it('throws when inserting a document with (.) in field name', () => {
    return expectError(async () => {
      const db = NedbStore.create({});
      await db.insert({ 'foo.bar': 123 }, { escapeKeys: false });
    }, 'Field names cannot contain a .');
  });

  it('encodes (.) characters in field names (by default)', async () => {
    const db = NedbStore.create({});
    const obj = {
      name: 'mary',
      foo: {
        count: 0,
        'bar.boo': {
          msg: 'hello',
          zoo: { 'a.b': null, z: null },
          'my.array': [{ 'mary.barnes': 23, 'zoe.smith': { scale: 34 }, bob: null }],
        },
      },
    };

    // Single.
    const res1 = await db.insert(obj); // NB: No "Field names cannot contain a ." error.
    const res2 = await db.findOne({ name: 'mary' });
    expect(res2).to.eql({ ...obj, _id: (res1 as any)._id });

    // Many (array).
    await db.insertMany([obj, obj]);
    const res4 = await db.find({ name: 'mary' });
    res4.forEach(item => {
      expect(item).to.eql({ ...obj, _id: item._id });
    });
  });

  it('inserts multiple documents', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = NedbStore.create<MyDoc>({});

    const res1 = await db.insertMany([{ name: 'foo' }, { name: 'bar' }]);
    expect(res1[0].name).to.eql('foo');
    expect(res1[1].name).to.eql('bar');

    expect((await db.findOne({ name: 'foo' })).name).to.eql('foo');
    expect((await db.findOne({ name: 'bar' })).name).to.eql('bar');
    expect(await db.findOne({ name: 'boo' })).to.eql(null);
  });

  it('when in-memory only isLoaded is never true', async () => {
    const db = NedbStore.create({});
    expect(db.isFileLoaded).to.eql(false);

    await db.insert({ name: 'foo' });
    await db.findOne({ name: 'foo' });
    expect(db.isFileLoaded).to.eql(false);
  });

  it('persists to file-system (autoload upon creation)', async () => {
    await removeDir();
    const filename = getFilename();
    expect(await fs.pathExists(filename)).to.eql(false);

    const db1 = NedbStore.create({ filename, autoload: true });
    expect(db1.isFileLoaded).to.eql(false);

    const res1 = await db1.insert({ name: 'foo' });
    expect(res1.name).to.eql('foo');
    expect(await fs.pathExists(filename)).to.eql(true);
    expect(db1.isFileLoaded).to.eql(true);

    const db2 = NedbStore.create({ filename, autoload: true });

    const res2 = await db2.findOne({ name: 'foo' });
    expect(res2.name).to.eql('foo');
    expect(db2.isFileLoaded).to.eql(true);
  });

  it('loadFile', async () => {
    await removeDir();
    const filename = getFilename();
    expect(await fs.pathExists(filename)).to.eql(false);

    const db = NedbStore.create({ filename });
    expect(db.isFileLoaded).to.eql(false);

    await db.loadFile();
    expect(db.isFileLoaded).to.eql(true);

    await db.insert({ name: 'foo' });
    await db.findOne({ name: 'foo' });
    expect(await fs.pathExists(filename)).to.eql(true);
  });

  it('loadFile (no filename)', async () => {
    await removeDir();

    const db = NedbStore.create({});
    expect(db.isFileLoaded).to.eql(false);

    await db.loadFile();
    expect(db.isFileLoaded).to.eql(false);

    await db.insert({ name: 'foo' });
    await db.findOne({ name: 'foo' });
  });

  it('autoloads before method calls', async () => {
    await removeDir();
    const filename = getFilename();

    const db = NedbStore.create({ filename });
    expect(db.isFileLoaded).to.eql(false);

    await db.insert({ name: 'foo' });
    await db.findOne({ name: 'foo' });
  });

  it('updateOne', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = NedbStore.create<MyDoc>({});
    await db.insertMany([{ name: 'foo' }, { name: 'zoo' }]);

    const res0 = await db.updateOne({ name: 'no-exist' }, { name: 'boo' });
    expect(res0.modified).to.eql(false);
    expect(res0.upsert).to.eql(false);

    const res1 = await db.updateOne({ name: 'foo' }, { name: 'boo' });
    expect(res1.modified).to.eql(true);
    expect(res1.upsert).to.eql(false);
    expect(res1.doc && res1.doc.name).to.eql('boo');

    const res2 = await db.find({});

    const names = res2.map(doc => doc.name);
    expect(names.filter(name => name === 'zoo').length).to.eql(1);
    expect(names.filter(name => name === 'boo').length).to.eql(1);
    expect(names.filter(name => name === 'foo').length).to.eql(0); // Changed.
  });

  it('updateOne (upsert)', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = NedbStore.create<MyDoc>({});

    const res1 = await db.find({});
    expect(res1).to.eql([]);

    const doc = { name: 'foo' };
    const res2 = await db.updateOne<MyDoc>(doc, doc, { upsert: true });

    expect(res2.modified).to.eql(true);
    expect(res2.upsert).to.eql(true);
    expect(res2.doc && res2.doc.name).to.eql('foo');
    expect(res2.doc && res2.doc._id).to.not.eql(undefined);

    const res3 = await db.find({});
    expect(res3.length).to.eql(1);
    expect(res3[0].name).to.eql('foo');
  });

  it('delete', async () => {
    const db = NedbStore.create();

    await db.insertMany([{ name: 'foo' }, { name: 'bar' }, { name: 'zoo' }]);
    const res1 = await db.find({});
    expect(res1.length).to.eql(3);

    const res2 = await db.remove({ name: 'foo' });
    expect(res2.total).to.eql(1);

    const res3 = await db.remove({ name: 'NO_EXIST' });
    expect(res3.total).to.eql(0);

    const res4 = await db.remove({ name: { $in: ['bar', 'zoo', 'other'] } }, { multi: true });
    expect(res4.total).to.eql(2);

    const res5 = await db.find({});
    expect(res5).to.eql([]);
  });
});
