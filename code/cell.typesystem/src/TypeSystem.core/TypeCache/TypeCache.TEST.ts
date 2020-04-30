import { expect, testFetch, TYPE_DEFS, MemoryCache } from '../../test';
import { TypeCache } from '.';

describe('TypeCache', () => {
  describe('fetch', () => {
    it('new instance (no cache provided)', () => {
      const fetch = TypeCache.fetch(testFetch({ defs: TYPE_DEFS }));
      expect(fetch.cache).to.be.an.instanceof(MemoryCache);
    });

    it('uses given cache', () => {
      const cache = TypeCache.create();
      const fetch = TypeCache.fetch(testFetch({ defs: TYPE_DEFS }), { cache });
      expect(fetch.cache).to.equal(cache);
    });

    it('does not double-wrap an existing cached fetcher', () => {
      const fetch1 = TypeCache.fetch(testFetch({ defs: TYPE_DEFS }));
      const fetch2 = TypeCache.fetch(fetch1);
      expect(fetch1).to.equal(fetch2); // NB: instance re-used.
    });

    it('exists', async () => {
      const fetch = TypeCache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns1 = 'ns:foo';
      const ns2 = 'ns:foo.color';

      const key1 = fetch.cacheKey('getNs', ns1);
      const key2 = fetch.cacheKey('getNs', ns2);
      expect(key1).to.not.eql(key2);

      expect(fetch.cache.exists(key1)).to.eql(false);
      expect(fetch.cache.exists(key2)).to.eql(false);

      await fetch.getNs({ ns: ns1 });

      expect(fetch.cache.exists(key1)).to.eql(true);
      expect(fetch.cache.exists(key2)).to.eql(false);
    });

    it('getNs', async () => {
      const fetch = TypeCache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns = 'ns:foo';
      const res1 = await fetch.getNs({ ns });
      const res2 = await fetch.getNs({ ns });
      expect(res1).to.not.eql(undefined);
      expect(res1).to.equal(res2);
      expect(fetch.cache.exists(fetch.cacheKey('getNs', ns))).to.eql(true);
    });

    it('getNs (parallel)', async () => {
      const fetch = TypeCache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns = 'ns:foo';
      const method = fetch.getNs;
      const [res1, res2] = await Promise.all([method({ ns }), method({ ns })]);
      expect(res1).to.not.eql(undefined);
      expect(res1).to.equal(res2);
      expect(fetch.cache.exists(fetch.cacheKey('getNs', ns))).to.eql(true);
    });

    it('getColumns', async () => {
      const fetch = TypeCache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns = 'ns:foo';
      const res1 = await fetch.getColumns({ ns });
      const res2 = await fetch.getColumns({ ns });
      expect(res1).to.not.eql(undefined);
      expect(res1).to.equal(res2);
      expect(fetch.cache.exists(fetch.cacheKey('getColumns', ns))).to.eql(true);
    });

    it('getCells', async () => {
      const fetch = TypeCache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns = 'ns:foo';
      const query = 'A1:Z9';
      const res1 = await fetch.getCells({ ns, query });
      const res2 = await fetch.getCells({ ns, query });
      expect(res1).to.not.eql(undefined);
      expect(res1).to.equal(res2);
      expect(fetch.cache.exists(fetch.cacheKey('getCells', ns, query))).to.eql(true);

      const res3 = await fetch.getCells({ ns, query: 'A1:A1' }); // NB: Different query.
      expect(res3).to.not.equal(res1);
    });
  });
});
