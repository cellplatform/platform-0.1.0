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

describe('MongoDb', function() {
  this.timeout(20000);

  it('put => get => dispose', async () => {
    const db = testDb();
    const message = `My value (file: ${filename})`;

    const res1 = await db.put('foo', message);
    expect(res1.value).to.eql(message);
    expect(res1.props.key).to.eql('foo');
    expect(res1.props.exists).to.eql(true);

    const res2 = await db.get('foo');
    expect(res2.value).to.eql(message);
    expect(res2.props.key).to.eql('foo');
    expect(res2.props.exists).to.eql(true);

    db.dispose();
  });
});
