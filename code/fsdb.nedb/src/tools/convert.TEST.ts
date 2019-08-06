import { convert } from '.';
import { Store } from '../store';
import { expect } from '../test';

describe('tools.convert', () => {
  let store: Store;

  it('path => _id', async () => {
    store = await Store.create({});

    await store.insertMany([
      { msg: 'hello' },
      { _id: '123', path: 'FOO/1', createdAt: 123 },
      { _id: '456', path: 'FOO/2', createdAt: 456 },
    ]);

    await convert.pathsToId({ store });

    const res = await store.find({});

    expect(res.length).to.eql(3);

    expect(res[0].msg).to.eql('hello');

    expect(res[1]._id).to.eql('FOO/1');
    expect(res[2]._id).to.eql('FOO/2');

    expect(res[1].createdAt).to.eql(123);
    expect(res[2].createdAt).to.eql(456);
  });
});
