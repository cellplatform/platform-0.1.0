import { expect, dotenv } from '../test';
import { MongoDb } from '.';

dotenv.config();

const testDb = () => {
  const uri = process.env.MONGO_TEST || '';
  return MongoDb.create({
    uri,
    db: 'test',
    collection: 'test.MongoDb',
  });
};

describe.only('MongoDb', function() {
  this.timeout(20000);

  it('put => get => dispose', async () => {
    const db = testDb();

    await db.put('foo', 123);
    const res = await db.get('foo');

    expect(res.value).to.eql(123);
    expect(res.props.key).to.eql('foo');
    expect(res.props.exists).to.eql(true);

    db.dispose();
  });
});
