import { convert } from '.';
import { NedbStore } from '../store';
import { expect, fs, R } from '../test';

const dir = fs.resolve('tmp/convert');
const removeDir = () => fs.remove(dir);

/**
 * NOTE:  Filename is incremented to avoid NEDB internal error
 *        when working with multiple instances of the same file-name.
 *        See: https://github.com/louischatriot/nedb/issues/462
 */
let count = 0;
const getFilename = () => fs.join(dir, `file-${count++}.db`);

describe('tools.convert', () => {
  let store: NedbStore;

  beforeEach(async () => removeDir());
  after(async () => removeDir());

  it('path => _id', async () => {
    const filename = getFilename();
    store = await NedbStore.create({ filename });

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
