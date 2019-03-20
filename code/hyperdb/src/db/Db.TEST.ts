import { fs } from '@platform/fs';
import { time } from '@platform/util.value';
import { expect } from 'chai';

import * as t from '../types';
import { Db } from './Db';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

const populate = async (db: t.IDb, keys: string[], options: { loop?: number } = {}) => {
  const loop = options.loop || 1;
  const wait = Array.from({ length: loop }).map(async (v, i) => {
    for (const key of keys) {
      await db.put(key, i + 1);
    }
  });
  await Promise.all(wait);
};

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

      await time.wait(10);

      expect(events.length).to.eql(2);
      expect(events[0].db.key).to.eql(db.key);
      expect(events[0].pattern).to.eql('foo');
      expect(events[0].key).to.eql('foo');
      expect(events[0].value).to.eql({ from: undefined, to: 123 });

      expect(events[1].db.key).to.eql(db.key);
      expect(events[1].pattern).to.eql('bar');
      expect(events[1].key).to.eql('bar');
      expect(events[1].value).to.eql({ from: undefined, to: 456 });
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
      expect(events[0].value).to.eql({ from: undefined, to: 'bar' });

      expect(events[1].pattern).to.eql('foo');
      expect(events[1].key).to.eql('foo/bar/baz');
      expect(events[1].value).to.eql({ from: undefined, to: 'baz' });
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
      expect(events[0].value).to.eql({ from: undefined, to: 'bar' });

      expect(events[1].pattern).to.eql('foo/bar');
      expect(events[1].key).to.eql('foo/bar/baz');
      expect(events[1].value).to.eql({ from: undefined, to: 'baz' });
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
      expect(events[0].value).to.eql({ from: undefined, to: 'baz' });
      expect(events[1].value).to.eql({ from: undefined, to: null });
    });

    it('value: from => to', async () => {
      const db = await Db.create({ dir });
      await db.watch();

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      await db.put('foo', 123);
      await time.wait(10);
      await db.put('foo', 456);
      await time.wait(10);

      expect(events.length).to.eql(2);
      expect(events[0].value).to.eql({ from: undefined, to: 123 });
      expect(events[1].value).to.eql({ from: 123, to: 456 });
    });

    it('isChanged', async () => {
      const db = await Db.create({ dir });
      await db.watch();

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      const put = async (value: any) => {
        await db.put('foo', value);
        await time.wait(10);
      };

      await put(123);
      await put(123);
      await put(456);

      await time.wait(10);
      expect(events.length).to.eql(3);
      expect(events[0].isChanged).to.eql(true);
      expect(events[1].isChanged).to.eql(false);
      expect(events[2].isChanged).to.eql(true);
    });

    it('isDeleted', async () => {
      const db = await Db.create({ dir });
      await db.watch();

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      await db.put('foo', 123);
      await time.wait(10);
      await db.delete('foo');

      await time.wait(10);
      expect(events.length).to.eql(2);
      expect(events[0].isDeleted).to.eql(false);
      expect(events[1].isDeleted).to.eql(true);
    });

    it('returns all value data-types', async () => {
      const db = await Db.create({ dir });
      await db.watch();

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      const now = new Date();

      const put = async (value: any) => {
        await db.put('foo', value);
        await time.wait(10);
      };

      await put(null);
      await put(undefined);
      await put(1.23);
      await put(true);
      await put(false);
      await put('text');
      await put([]);
      await put([1, 2, 3]);
      await put({ foo: 123 });
      await put(now);

      expect(events[0].value).to.eql({ from: undefined, to: null });
      expect(events[1].value).to.eql({ from: undefined, to: undefined });
      expect(events[2].value).to.eql({ from: undefined, to: 1.23 });
      expect(events[3].value).to.eql({ from: 1.23, to: true });
      expect(events[4].value).to.eql({ from: true, to: false });
      expect(events[5].value).to.eql({ from: false, to: 'text' });
      expect(events[6].value).to.eql({ from: 'text', to: [] });
      expect(events[7].value).to.eql({ from: [], to: [1, 2, 3] });
      expect(events[8].value).to.eql({ from: [1, 2, 3], to: { foo: 123 } });
      expect(events[9].value).to.eql({ from: { foo: 123 }, to: now });
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

    it('debounces multiple key matches', async () => {
      const db = await Db.create({ dir });
      await db.watch('cell');
      await db.watch('cell/');
      await db.watch('cell/A1');

      const events: t.IDbWatchChange[] = [];
      db.watch$.subscribe(e => events.push(e));

      db.put('cell/A1', 123); // NB: All watch patterns above match this.
      db.put('cell/A2', 456);

      await time.wait(50);
      expect(events.length).to.eql(2);
      expect(events[0].key).to.eql('cell/A1');
      expect(events[1].key).to.eql('cell/A2');
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

  describe('history', () => {
    it('entire history for a key', async () => {
      const db = await Db.create({ dir });
      await populate(db, ['foo'], { loop: 3 });

      const res = await db.history('foo');
      const current = await db.get('foo');

      expect(res.length).to.eql(3);
      expect(res[0].value).to.eql(current.value);

      expect(res[0].value).to.eql(3);
      expect(res[1].value).to.eql(2);
      expect(res[2].value).to.eql(1);
    });

    it('take 0 / -1 (empty array)', async () => {
      const test = async (take: number) => {
        const db = await Db.create({ dir });
        await populate(db, ['foo'], { loop: 3 });
        const res = await db.history('foo', { take });
        expect(res).to.eql([]);
      };
      await test(0);
      await test(-1);
      await test(-99);
    });

    it('takes a single history item (current)', async () => {
      const db = await Db.create({ dir });
      await populate(db, ['foo'], { loop: 3 });
      const res = await db.history('foo', { take: 1 });
      const current = await db.get('foo');

      expect(res.length).to.eql(1);
      expect(res[0].value).to.eql(current.value);
    });

    it('takes a two history items (last and current)', async () => {
      const db = await Db.create({ dir });
      await populate(db, ['foo'], { loop: 3 });
      const res = await db.history('foo', { take: 2 });
      const current = await db.get('foo');

      expect(res.length).to.eql(2);
      expect(res[0].value).to.eql(current.value);
      expect(res[0].value).to.eql(3);
      expect(res[1].value).to.eql(2);
    });

    it('key/value does not exist', async () => {
      const db = await Db.create({ dir });
      const res = await db.history('foo');
      const current = await db.get('foo');
      expect(current.props.exists).to.eql(false);
      expect(res).to.eql([]);
    });
  });

  describe('stats', () => {
    it('default stats', async () => {
      const db = await Db.create({ dir });
      const res1 = await db.stats();

      expect(res1.dir).to.eql(dir);
      expect(res1.size.bytes).to.greaterThan(2000);

      await Promise.all(
        Array.from({ length: 10 }).map(async (v, i) => {
          const key = `cell/${i}`;
          await db.put(key, LOREM);
        }),
      );

      const res2 = await db.stats();
      expect(res2.size.bytes).to.greaterThan(res1.size.bytes);
    });
  });
});
