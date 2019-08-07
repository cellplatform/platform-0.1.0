import { expect, mongodb, dotenv } from '../test';
dotenv.config();

describe('Store (Mongo)', () => {
  it('FOO', async () => {
    expect(123).to.eql(123);

    const MongoClient = mongodb.MongoClient;

    const uri = process.env.MONGO_TEST as string;
    const dbName = 'mytest';

    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
      const db = client.db(dbName);

      const collection = db.collection('documents');
      // Insert some documents
      collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], function(err, result) {
        // console.log('Inserted 3 documents into the collection');
        // console.log('result', result);
      });

      client.close();
    });
  });
});
