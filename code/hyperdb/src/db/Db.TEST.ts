import { expect } from 'chai';
import { Db } from './Db';
import { fs } from '@platform/fs';

const dir = 'tmp/db';
after(async () => fs.remove('tmp'));

describe('Db', () => {
  beforeEach(async () => fs.remove(dir));

  describe('properties', () => {
    it('exposes keys as string', async () => {
      const db = await Db.create({ dir });
      expect(typeof db.key).to.eql('string');
      expect(typeof db.localKey).to.eql('string');
      expect(typeof db.discoveryKey).to.eql('string');
    });

    it('exposes keys as buffers', async () => {
      const db = await Db.create({ dir });
      expect(db.buffer.key).to.be.an.instanceof(Buffer);
      expect(db.buffer.localKey).to.be.an.instanceof(Buffer);
      expect(db.buffer.discoveryKey).to.be.an.instanceof(Buffer);

      expect(db.buffer.key.toString('hex')).to.eql(db.key);
      expect(db.buffer.localKey.toString('hex')).to.eql(db.localKey);
      expect(db.buffer.discoveryKey.toString('hex')).to.eql(db.discoveryKey);
    });
  });

  describe('updating values', () => {
    it('put/get value', async () => {
      const KEY = 'foo';
      const db = await Db.create({ dir });
      const test = async (value: any, expected = value) => {
        await db.delete(KEY);
        await db.put(KEY, value);
        const res = await db.get(KEY);
        expect(res.value).to.eql(
          expected,
          `DB value '${res.value}' not same as original '${value}'.`,
        );
      };

      await test(undefined);
      await test(null);
      await test(1.23);
      await test(true);
      await test(false);
      await test('foo');
      await test({ foo: 123 });
      await test([]);
      await test([1, 2, 3]);
      await test(['hello', 'there']);
      await test([1, 'two', true, false, null]);
      await test([{ foo: 123 }]);
      await test([undefined], [null]); // NB: JSON converts undefined to null in arrays.
      await test([null], [null]);

      const now = new Date();
      await test(now, now);
    });

    it('deletes a value', async () => {
      const KEY = 'foo';
      const db = await Db.create({ dir });
      expect((await db.put(KEY, 123)).value).to.eql(123);
      expect((await db.get(KEY)).value).to.eql(123);

      const res = await db.delete(KEY);
      expect(res.value).to.eql(undefined);
      expect(res.meta.deleted).to.eql(true);
    });
  });

  describe('watch', () => {});
});
