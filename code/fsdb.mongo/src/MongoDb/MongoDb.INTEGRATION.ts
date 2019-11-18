import { expect, fs } from '../test';
import { MongoDb } from '.';
import { MongoStore, IMongoStoreArgs } from '../store';

const filename = fs.basename(__filename);

const DB: IMongoStoreArgs = {
  uri: process.env.MONGO_TEST || '',
  db: 'test@platform',
  collection: `fsdb.mongo/MongoDb`,
};
const testDb = () => MongoDb.create(DB);

const drop = async () => {
  const store = MongoStore.create(DB);
  await store.drop();
  store.dispose();
};

after(async () => {
  await drop();
});

describe.only('MongoDb', function() {
  this.timeout(20000);

  it('put => get => dispose', async () => {
    const db = testDb();

    const message = `My value (file: ${filename})`;
    await db.put('foo', message);
    const res = await db.get('foo');

    expect(res.value).to.eql(message);
    expect(res.props.key).to.eql('foo');
    expect(res.props.exists).to.eql(true);

    db.dispose();
  });
});
