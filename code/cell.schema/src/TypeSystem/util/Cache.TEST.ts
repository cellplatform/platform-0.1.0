import { expect, testFetch, TYPE_DEFS } from '../test';
import { Cache } from './Cache';

describe('Cache', () => {
  describe('fetch', () => {
    it('exists', async () => {
      const fetch = Cache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns1 = 'ns:foo';
      const ns2 = 'ns:foo.color';

      const key1 = fetch.cacheKey('getType', ns1);
      const key2 = fetch.cacheKey('getType', ns2);
      expect(key1).to.not.eql(key2);

      expect(fetch.cache.exists(key1)).to.eql(false);
      expect(fetch.cache.exists(key2)).to.eql(false);

      await fetch.getType({ ns: ns1 });

      expect(fetch.cache.exists(key1)).to.eql(true);
      expect(fetch.cache.exists(key2)).to.eql(false);
    });

    it('getType', async () => {
      const fetch = Cache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns = 'ns:foo';
      const res1 = await fetch.getType({ ns });
      const res2 = await fetch.getType({ ns });
      expect(res1).to.not.eql(undefined);
      expect(res1).to.equal(res2);
      expect(fetch.cache.exists(fetch.cacheKey('getType', ns))).to.eql(true);
    });

    it('getType (parallel)', async () => {
      const fetch = Cache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns = 'ns:foo';
      const method = fetch.getType;
      const [res1, res2] = await Promise.all([method({ ns }), method({ ns })]);
      expect(res1).to.not.eql(undefined);
      expect(res1).to.equal(res2);
      expect(fetch.cache.exists(fetch.cacheKey('getType', ns))).to.eql(true);
    });

    it('getColumns', async () => {
      const fetch = Cache.fetch(testFetch({ defs: TYPE_DEFS }));
      const ns = 'ns:foo';
      const res1 = await fetch.getColumns({ ns });
      const res2 = await fetch.getColumns({ ns });
      expect(res1).to.not.eql(undefined);
      expect(res1).to.equal(res2);
      expect(fetch.cache.exists(fetch.cacheKey('getColumns', ns))).to.eql(true);
    });

    it('getCells', async () => {
      const fetch = Cache.fetch(testFetch({ defs: TYPE_DEFS }));
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
