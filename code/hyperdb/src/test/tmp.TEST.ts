import { fs } from '@platform/fs';
import { expect } from 'chai';
import { Db } from '..';
import { time } from '../common';
import * as filesize from 'filesize';

const dir = 'tmp-1/db-size';
// after(async () => fs.remove('tmp'));

describe.only('tmp', function() {
  this.timeout(999999);
  // beforeEach(async () => fs.remove(dir));

  it('large', async () => {
    const db = await Db.create({ dir });
    const timer = time.timer();

    const KEY = 'foo';

    console.log('started...');
    const wait = Array.from({ length: 1000 }).map(async (v, i) => {
      const value = `value-${i + 1}`;
      await db.put(KEY, value);
    });

    await Promise.all(wait);

    // await db.put(KEY, 123);

    const foo = await db.get(KEY);
    console.log('foo', foo.value);
    console.log('foo / seq', foo.props.seq);

    console.log('-------------------------------------------');
    const stats = await db.stats();
    const size = filesize(stats.size.bytes);
    console.log('size', size);
    // console.log('filesize', filesize);
    // console.log('stats', stats.size);
    console.log('elapsed', timer.elapsed());
  });
});
