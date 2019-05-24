import { fs } from '@platform/fs';
import { expect } from 'chai';

import { Db } from '.';
import * as util from './util';
import { time, t } from '../common';

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

  describe('timestamp', () => {
    it('does nothing with non-object', () => {
      expect(util.formatTimestamps(undefined as any)).to.eql(undefined);
      expect(util.formatTimestamps(123 as any)).to.eql(123);
      expect(util.formatTimestamps(true as any)).to.eql(true);
      expect(util.formatTimestamps('hello' as any)).to.eql('hello');
    });

    it('does nothing with non timestamp object', () => {
      expect(util.formatTimestamps({} as any)).to.eql({});
    });

    it('does nothing timestamp values are not numbers', () => {
      const model: any = { createdAt: 'hello', modifiedAt: { foo: 123 } };
      expect(util.formatTimestamps(model)).to.eql(model);
    });

    it('converts to now', () => {
      const now = time.now.timestamp;
      const model = util.formatTimestamps({ createdAt: -1, modifiedAt: -1 });
      expect(model).to.eql({ createdAt: now, modifiedAt: now });
    });

    it('converts to given default date', () => {
      const now = 1234;
      const model = util.formatTimestamps({ createdAt: -1, modifiedAt: -1 }, now);
      expect(model).to.eql({ createdAt: now, modifiedAt: now });
    });

    it('increments modified date', () => {
      const initial = 1234;
      const now = time.now.timestamp;
      const model1 = util.formatTimestamps({ createdAt: -1, modifiedAt: -1 }, initial);
      const model2 = util.incrementTimestamps(model1);
      expect(model2).to.eql({ createdAt: initial, modifiedAt: now });
    });
  });
});
