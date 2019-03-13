import { fs } from '@platform/fs';
import { time } from '@platform/util.value';
import { expect } from 'chai';

import * as t from '../types';
import { Db } from './Db';

const dir = 'tmp/db';
after(async () => fs.remove('tmp'));

describe('Db', () => {
  beforeEach(async () => fs.remove(dir));

  describe('properties', () => {
    it('exposes dir as property', async () => {
      const db = await Db.create({ dir });
      expect(db.dir).to.eql(dir);
    });

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

      const res1 = await db.delete(KEY);
      const res2 = await db.get(KEY);

      expect(res1.value).to.eql(undefined);
      expect(res1.props.deleted).to.eql(true);

      expect(res2.value).to.eql(undefined);
      expect(res2.props.deleted).to.eql(undefined);
    });
  });

  describe('watch', () => {
    it('watching (nothing)', async () => {
      const db = await Db.create({ dir });
      expect(db.watching).to.eql([]);
    });

    it('watches a specific keys', async () => {
      const db = await Db.create({ dir });
      expect(db.watching).to.eql([]);

      await db.watch('foo', 'bar');
      expect(db.watching).to.eql(['foo', 'bar']);

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      await db.put('foo', 123);
      await db.put('bar', 456);
      await db.put('baz', 789); // Not watched.

      expect(events.length).to.eql(2);
      expect(events[0].db.key).to.eql(db.key);
      expect(events[0].pattern).to.eql('foo');
      expect(events[0].key).to.eql('foo');
      expect(events[0].value).to.eql(123);

      expect(events[1].db.key).to.eql(db.key);
      expect(events[1].pattern).to.eql('bar');
      expect(events[1].key).to.eql('bar');
      expect(events[1].value).to.eql(456);
    });

    it('watches a path of keys ("foo" => "foo/bar" | "foo/bar/baz")', async () => {
      const db = await Db.create({ dir });
      expect(db.watching).to.eql([]);

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      await db.watch('foo');
      await db.put('foo/bar', 'bar');
      await db.put('foo/bar/baz', 'baz');
      await db.put('bar', 123); // No match.

      await time.wait(10);
      expect(events.length).to.eql(2);
      expect(events[0].pattern).to.eql('foo');
      expect(events[0].key).to.eql('foo/bar');
      expect(events[0].value).to.eql('bar');

      expect(events[1].pattern).to.eql('foo');
      expect(events[1].key).to.eql('foo/bar/baz');
      expect(events[1].value).to.eql('baz');
    });

    it('watches a path of keys ("foo/bar" => "foo/bar/baz")', async () => {
      const db = await Db.create({ dir });
      expect(db.watching).to.eql([]);

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      await db.watch('foo/bar');
      await db.put('foo/bar', 'bar');
      await db.put('foo/bar/baz', 'baz');
      await db.put('bar', 123); // No match.
      await db.put('foo', 456); // No match.
      await db.put('foo/zoo', 789); // No match.

      await time.wait(10);
      expect(events.length).to.eql(2);
      expect(events[0].pattern).to.eql('foo/bar');
      expect(events[0].key).to.eql('foo/bar');
      expect(events[0].value).to.eql('bar');

      expect(events[1].pattern).to.eql('foo/bar');
      expect(events[1].key).to.eql('foo/bar/baz');
      expect(events[1].value).to.eql('baz');
    });

    it('watches all keys', async () => {
      const db = await Db.create({ dir });
      await db.watch();
      await db.watch();
      expect(db.watching).to.eql(['*']);

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      await db.put('foo/bar/baz', 'baz');
      await db.put('foo', null);

      await time.wait(10);
      expect(events.length).to.eql(2);
      expect(events[0].value).to.eql('baz');
      expect(events[1].value).to.eql(null);
    });

    it('returns all value data-types', async () => {
      const db = await Db.create({ dir });
      await db.watch();

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      const now = new Date();
      await db.put('foo', null);
      await db.put('foo', undefined);
      await db.put('foo', 1.23);
      await db.put('foo', true);
      await db.put('foo', false);
      await db.put('foo', 'text');
      await db.put('foo', []);
      await db.put('foo', [1, 2, 3]);
      await db.put('foo', { foo: 123 });
      await db.put('foo', now);

      await time.wait(10);
      expect(events[0].value).to.eql(null);
      expect(events[1].value).to.eql(undefined);
      expect(events[2].value).to.eql(1.23);
      expect(events[3].value).to.eql(true);
      expect(events[4].value).to.eql(false);
      expect(events[5].value).to.eql('text');
      expect(events[6].value).to.eql([]);
      expect(events[7].value).to.eql([1, 2, 3]);
      expect(events[8].value).to.eql({ foo: 123 });
      expect(events[9].value).to.eql(now);
    });

    it('does not watch more than once', async () => {
      const db = await Db.create({ dir });
      expect(db.watching).to.eql([]);

      await db.watch();
      await db.watch();
      await db.watch();
      expect(db.watching).to.eql(['*']);

      await db.watch('foo');
      await db.watch('foo');
      await db.watch('foo');
      expect(db.watching).to.eql(['*', 'foo']);
    });

    it('ignores specific keys when wildcard watch exists', async () => {
      const db = await Db.create({ dir });
      await db.watch();
      await db.watch('foo');
      expect(db.watching).to.eql(['*', 'foo']);

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      await db.put('foo', 123);

      await time.wait(10);
      expect(events.length).to.eql(1);
    });
  });

  describe('unwatch', () => {
    it('unwatches all', async () => {
      const db = await Db.create({ dir });
      await db.watch();
      await db.watch('foo');

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      await db.put('foo', 123);
      await time.wait(10);
      expect(events.length).to.eql(1);

      db.unwatch();
      await db.put('foo', 456);
      await db.put('foo', 789);

      await time.wait(10);
      expect(events.length).to.eql(1);
    });

    it('unwatches specific pattern', async () => {
      const db = await Db.create({ dir });
      await db.watch();
      await db.watch('foo', 'bar');
      expect(db.watching).to.eql(['*', 'foo', 'bar']);

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      let count = 0;
      const updateValues = async () => {
        await db.put('foo', count++);
        await db.put('bar', count++);
        await db.put('baz', count++); // via wildcard.
        await time.wait(10);
      };

      await updateValues();
      expect(events.length).to.eql(3);

      await db.unwatch('bar');
      expect(db.watching).to.eql(['*', 'foo']);

      await updateValues();
      expect(events.length).to.eql(6); // NB: wildcard still catching all changes.

      await db.unwatch('*');
      expect(db.watching).to.eql(['foo']);

      await updateValues();
      expect(events.length).to.eql(7); // Only "foo" was fired now.
    });
  });

  describe('values', () => {
    const populate = async (db: t.IDb, keys: string[], options: { loop?: number } = {}) => {
      const loop = options.loop || 1;
      const wait = Array.from({ length: loop }).map(async (v, i) => {
        for (const key of keys) {
          await db.put(key, i + 1);
        }
      });
      await Promise.all(wait);
    };

    it('no values ({})', async () => {
      const db = await Db.create({ dir });
      await populate(db, []);
      const res = await db.values();
      expect(res).to.eql({});
    });

    it('has values (foo, bar)', async () => {
      const db = await Db.create({ dir });
      await populate(db, ['foo', 'bar']);

      const res = await db.values();
      expect(Object.keys(res).length).to.eql(2);
      expect(res.foo.value).to.eql(1);
      expect(res.bar.value).to.eql(1);
      expect(res.zoo).to.eql(undefined);
    });

    it('object value', async () => {
      const db = await Db.create({ dir });
      await db.put('foo', { foo: 123 });
      const res = await db.values();
      expect(res.foo.value).to.eql({ foo: 123 });
    });

    it('filters on pattern prefix', async () => {
      const db = await Db.create({ dir });
      await populate(db, ['foo', 'foo/A1', 'foo/A2', 'bar', 'bar/A1', 'bar/A2']);

      const res1 = await db.values({ pattern: 'foo' });
      const res2 = await db.values({ pattern: 'foo/' });
      const res3 = await db.values({ pattern: 'foo/A' });

      expect(Object.keys(res1).length).to.eql(3);
      expect(Object.keys(res2).length).to.eql(2);
      expect(Object.keys(res3).length).to.eql(0);

      expect(res1.foo.props.key).to.eql('foo');
      expect(res1['foo/A1'].props.key).to.eql('foo/A1');
      expect(res1['foo/A2'].props.key).to.eql('foo/A2');
    });

    it('non-recursive', async () => {
      const db = await Db.create({ dir });
      await populate(db, ['foo', 'foo/A1', 'foo/A2', 'bar', 'bar/A1', 'bar/A2']);

      const res = await db.values({ recursive: false });

      expect(Object.keys(res).length).to.eql(2);
      expect(res['foo/A2'].props.key).to.eql('foo/A2');
      expect(res['bar/A2'].props.key).to.eql('bar/A2');
    });
  });
});
