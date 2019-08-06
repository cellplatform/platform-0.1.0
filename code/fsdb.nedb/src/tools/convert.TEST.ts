import { expect, fs, time, t } from '../test';
import { Store } from '../store';

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
  let db: Store;

  beforeEach(async () => (db = await Store.create({ filename: getFilename() })));
  // afterEach(() => {});
  after(async () => removeDir());

  it('path => _id', async () => {
    // const store = Store.create({});

    // db.update({_id:'123', path: 'FOO/bar'})
    // db.insert({ _id: '123', path: 'FOO/bar' });
    console.log('db', db);
  });
});
