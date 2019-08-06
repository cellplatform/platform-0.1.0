import { convert } from '.';
import { Store } from '../store';
import { expect, R } from '../test';

describe('tools.convert', () => {
  let store: Store;

  it('path => _id', async () => {
    store = await Store.create({});

    await store.insertMany([
      { msg: 'hello', createdAt: 999 },
      { _id: '123', path: 'FOO/1', createdAt: 123 },
      { _id: '456', path: 'FOO/2', createdAt: 456 },
    ]);

    await convert.pathsToId({ store });

    let res = await store.find({});
    res = R.sortWith([R.ascend(R.prop('createdAt'))], res);

    expect(res.length).to.eql(3);

    expect(res[0]._id).to.eql('FOO/1');
    expect(res[1]._id).to.eql('FOO/2');

    expect(res[0].createdAt).to.eql(123);
    expect(res[1].createdAt).to.eql(456);

    expect(res[2].msg).to.eql('hello');
  });
});
