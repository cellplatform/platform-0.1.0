import { fs } from '@platform/fs';
import { expect } from 'chai';

import { Db } from '.';

const dir = 'tmp/db';
after(async () => fs.remove('tmp'));

describe('DB (util)', () => {
  beforeEach(async () => fs.remove(dir));

  describe('converting values object', () => {
    it('toValues', async () => {
      const db = await Db.create({ dir });
      await db.put('foo', 123);
      await db.put('bar', { msg: 'hello' });

      const values = await db.values({});
      const res = await Db.toValues(values);
      expect(res).to.eql({ foo: 123, bar: { msg: 'hello' } });
    });

    it('toKeyValueList', async () => {
      const db = await Db.create({ dir });
      await db.put('foo', 123);
      await db.put('bar', { msg: 'hello' });

      const values = await db.values({});
      const res = await Db.toKeyValueList(values);

      expect(res.length).to.eql(2);
      expect(res[0]).to.eql({ key: 'foo', value: 123 });
      expect(res[1]).to.eql({ key: 'bar', value: { msg: 'hello' } });
    });

    it('toValueList', async () => {
      const db = await Db.create({ dir });
      await db.put('foo', 123);
      await db.put('bar', { msg: 'hello' });

      const values = await db.values({});
      const res = await Db.toValueList(values);

      expect(res.length).to.eql(2);
      expect(res[0]).to.eql(123);
      expect(res[1]).to.eql({ msg: 'hello' });
    });
  });
});
