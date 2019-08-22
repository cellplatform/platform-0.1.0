import { expect } from 'chai';
import * as hyperdb from '.';
import { fs } from '@platform/fs';

const dir = 'tmp/db';
after(async () => fs.remove('tmp'));
beforeEach(async () => fs.remove(dir));

describe('entry-point', () => {
  beforeEach(() => hyperdb.factory.reset());

  it('creates', async () => {
    const res = await hyperdb.create({ dir });
    expect(res && res.db.dir).to.eql(dir);
  });

  it('get', async () => {
    const res = await hyperdb.get({ dir });
    expect(res).to.eql(undefined);
  });

  it('getOrCreate', async () => {
    const res = await hyperdb.create({ dir });
    expect(res && res.db.dir).to.eql(dir);
  });
});
