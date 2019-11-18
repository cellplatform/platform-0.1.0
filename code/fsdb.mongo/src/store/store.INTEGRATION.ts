import { expect, dotenv } from '../test';
import { MongoStore } from '.';

dotenv.config();
const uri = process.env.MONGO_TEST as string;
const db = 'test';
const collection = 'fsdb.mongo/store';

describe('Store (Mongo)', function() {
  this.timeout(20000);
  let store: MongoStore;

  before(() => {
    store = MongoStore.create({ uri, db, collection });
  });

  const drop = async () => {
    await store.drop();
  };

  after(async () => {
    await drop();
    store.dispose();
  });

  it('insert', async () => {
    await drop();
    const res = await store.insert({ name: 'insert' });
    expect(res.name).to.eql('insert');
    expect((res as any)._id).to.not.eql(undefined);
  });

  it.only('insertMany', async () => {
    await drop();
    const docs = [{ name: 'insertMany', count: 1 }, { name: 'insertMany', count: 2 }];
    const res = await store.insertMany(docs);

    expect(res[0].count).to.eql(1);
    expect((res[0] as any)._id).to.not.eql(undefined);

    expect(res[1].count).to.eql(2);
    expect((res[1] as any)._id).to.not.eql(undefined);
  });

  it('updateOne (existing doc)', async () => {
    await drop();
    const doc = await store.insert<any>({ name: 'update' });
    const res = await store.updateOne({ _id: doc._id }, { name: 'update => foo' });

    expect(res.modified).to.eql(true);
    expect(res.upsert).to.eql(false);
    expect(res.doc).to.eql(undefined);
  });

  it('updateOne (upsert)', async () => {
    await drop();
    const res = await store.updateOne({}, { name: 'new doc' }, { upsert: true });

    expect(res.modified).to.eql(true);
    expect(res.upsert).to.eql(true);

    expect(res.doc && typeof res.doc._id === 'string').to.eql(true);
    expect(res.doc && res.doc.name).to.eql('new doc');
  });

  it('findOne', async () => {
    await drop();
    type Doc = { _id: string; foo: number };

    const res1 = await store.findOne({});
    expect(res1).to.eql(undefined);

    await store.insertMany([{ foo: 123 }, { foo: 456 }]);

    const res2 = await store.findOne<Doc>({});
    expect(res2 && res2.foo).to.eql(123);
  });

  it('find', async () => {
    await drop();
    type Doc = { _id: string; foo: number };

    const res1 = await store.find({});
    expect(res1).to.eql([]);

    await store.insertMany([{ foo: 123 }, { foo: 456 }, { foo: 123 }]);

    const res2 = await store.find<Doc>({});

    expect(res2.length).to.eql(3);
    expect(res2[0].foo).to.eql(123);
    expect(res2[1].foo).to.eql(456);
    expect(res2[2].foo).to.eql(123);

    const res3 = await store.find<Doc>({ foo: 123 });
    expect(res3.length).to.eql(2);
    expect(res3[0].foo).to.eql(123);
    expect(res3[1].foo).to.eql(123);

    const res4 = await store.find<Doc>({ foo: -1 });
    expect(res4).to.eql([]);
  });

  it('remove (single, default)', async () => {
    await drop();

    await store.remove({ foo: 123 });
    const res0 = await store.find({});
    expect(res0).to.eql([]);

    await store.insertMany([{ foo: 123 }, { foo: 456 }, { foo: 789 }]);

    await store.remove({}); // query "all", first item only removed.
    const res1 = await store.find({});
    expect(res1.length).to.eql(2);
    expect(res1[0].foo).to.eql(456);
    expect(res1[1].foo).to.eql(789);

    await store.remove({ foo: 456 });
    const res2 = await store.find({});
    expect(res2.length).to.eql(1);
    expect(res2[0].foo).to.eql(789);
  });

  it('remove (multi)', async () => {
    await drop();
    await store.insertMany([{ foo: 123 }, { foo: 456 }, { foo: 123 }, { foo: 888 }]);

    await store.remove({ foo: 123 }, { multi: true });
    const res1 = await store.find({});
    expect(res1.length).to.eql(2);
    expect(res1[0].foo).to.eql(456);
    expect(res1[1].foo).to.eql(888);

    await store.remove({}, { multi: true }); // query "all" items.
    const res2 = await store.find({});
    expect(res2).to.eql([]);
  });
});
