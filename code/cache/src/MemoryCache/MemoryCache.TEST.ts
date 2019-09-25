import { expect } from 'chai';
import { MemoryCache } from './MemoryCache';

describe('MemoryCache', () => {
  type MyKey = 'FOO' | 'BAR';

  it('loose key type (not defined)', async () => {
    const cache = new MemoryCache();
    expect(cache.get('FOO')).to.eql(undefined);
  });

  it('does not have value', () => {
    const cache = MemoryCache.create<MyKey>();
    expect(cache.get('FOO')).to.eql(undefined);
    expect(cache.get('BAR')).to.eql(undefined);
  });

  it('retrieves default value', () => {
    const cache = MemoryCache.create<MyKey>();
    expect(cache.get('FOO', () => 123)).to.eql(123);
  });

  it('caches a default value (via func)', () => {
    const cache = MemoryCache.create<MyKey>();
    const res1 = cache.get('FOO');
    const res2 = cache.get('FOO', () => 123);
    const res3 = cache.get('FOO');

    expect(res1).to.eql(undefined);
    expect(res2).to.eql(123);
    expect(res3).to.eql(123);
  });

  it('caches a default value (via args { func })', () => {
    const cache = MemoryCache.create<MyKey>();
    const res1 = cache.get('FOO');
    const res2 = cache.get('FOO', { getValue: () => 123 });
    const res3 = cache.get('FOO');

    expect(res1).to.eql(undefined);
    expect(res2).to.eql(123);
    expect(res3).to.eql(123);
  });

  it('cached default value (getAsync)', async () => {
    const cache = MemoryCache.create<MyKey>();
    const res1 = await cache.getAsync('FOO', async () => 123);
    const res2 = await cache.getAsync('BAR', { getValue: async () => 456 });

    expect(res1).to.eql(123);
    expect(res2).to.eql(456);

    const res3 = cache.get('FOO');
    const res4 = cache.get('BAR');

    expect(res3).to.eql(123); // NB: Actual value stored, not the {Promise}.
    expect(res4).to.eql(456);
  });

  it('forces new retrieval of value (via args { force })', () => {
    let count = 0;
    const getValue = () => {
      count++;
      return count;
    };

    const cache = MemoryCache.create<MyKey>();

    expect(cache.get('FOO', { getValue })).to.eql(1);
    expect(cache.get('FOO', { getValue })).to.eql(1);
    expect(cache.get('FOO', { getValue })).to.eql(1);
    expect(count).to.eql(1);

    expect(cache.get('FOO', { getValue, force: true })).to.eql(2);
    expect(count).to.eql(2);

    expect(cache.get('FOO', { getValue })).to.eql(2);
    expect(count).to.eql(2);
  });

  it('does not retreive default value', () => {
    const cache = MemoryCache.create<MyKey>();
    cache.put('FOO', 888);
    expect(cache.get('FOO', () => 123)).to.eql(888);
  });

  it('retrieves cached value', () => {
    const cache = MemoryCache.create<MyKey>();

    cache
      .put('FOO', 1)
      .put('FOO', 2)
      .put('BAR', 3);

    expect(cache.get('FOO')).to.eql(2);
    expect(cache.get('BAR')).to.eql(3);
  });

  it('keys', () => {
    const cache = MemoryCache.create<MyKey>();
    expect(cache.keys).to.eql([]);

    expect(cache.get('FOO', () => 123)).to.eql(123);
    expect(cache.keys).to.eql(['FOO']);

    cache.put('BAR', 456);
    expect(cache.keys).to.eql(['FOO', 'BAR']);

    cache.delete('FOO');
    expect(cache.keys).to.eql(['BAR']);

    cache.clear();
    expect(cache.keys).to.eql([]);
  });

  it('deletes cached value', () => {
    const cache = MemoryCache.create<MyKey>();
    cache.put('FOO', 1).put('BAR', 2);
    expect(cache.get('FOO')).to.eql(1);
    expect(cache.get('BAR')).to.eql(2);

    cache
      .delete('FOO')
      .delete('FOO')
      .delete('BAR');

    expect(cache.get('FOO')).to.eql(undefined);
    expect(cache.get('BAR')).to.eql(undefined);
  });

  it('clears cache', () => {
    const cache = MemoryCache.create<MyKey>();
    cache.put('FOO', 1).put('BAR', 2);
    expect(cache.get('FOO')).to.eql(1);
    expect(cache.get('BAR')).to.eql(2);

    cache.clear();
    expect(cache.get('FOO')).to.eql(undefined);
    expect(cache.get('BAR')).to.eql(undefined);
  });

  it('clears subset (filter)', () => {
    const cache = MemoryCache.create();
    cache
      .put('FOO/1', 1)
      .put('FOO/2', 2)
      .put('BAR/1', 1);
    expect(cache.keys).to.eql(['FOO/1', 'FOO/2', 'BAR/1']);
    cache.clear({ filter: key => key.startsWith('FOO/') });
    expect(cache.keys).to.eql(['BAR/1']);
  });

  it('expires values', async () => {
    const cache = new MemoryCache<MyKey>({ ttl: 5 });

    cache.put('FOO', 1).put('BAR', 2);
    expect(cache.get('FOO')).to.eql(1);
    expect(cache.get('BAR')).to.eql(2);

    await wait(10);
    expect(cache.get('FOO')).to.eql(undefined);
    expect(cache.get('BAR')).to.eql(undefined);
  });

  it('clears expiry timer when putting new value', async () => {
    const cache = new MemoryCache<MyKey>({ ttl: 10 });

    cache.put('FOO', 1);
    await wait(5);

    cache.put('FOO', 2);
    await wait(5);

    cache.put('FOO', 3);
    await wait(5);

    expect(cache.get('FOO')).to.eql(3);
  });

  it('exists', () => {
    const cache = MemoryCache.create<MyKey>();
    expect(cache.exists('FOO')).to.eql(false);
    cache.put('FOO', 123);
    expect(cache.exists('FOO')).to.eql(true);
  });
});

/**
 * [Helpers]
 */

async function wait(msecs: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), msecs);
  });
}
