import { TypeCache, TypeCacheCells } from '.';
import { expect, MemoryCache, testFetch, TYPE_DEFS } from '../../test';

describe('TypeCache', () => {
  const CELLS = {
    A1: { value: 'A1' },
    Z1: { value: 'Z1' },
    B2: { value: 'B2' },
    C3: { value: 'C3' },
    Z9: { value: 'Z9' },
  };

  describe('fetch (wrap)', () => {
    it('new instance (no cache provided)', () => {
      const fetch = TypeCache.wrapFetch(testFetch({ defs: TYPE_DEFS }));
      expect(fetch.cache).to.be.an.instanceof(MemoryCache);
    });

    it('uses given cache', () => {
      const cache = TypeCache.create();
      const fetch = TypeCache.wrapFetch(testFetch({ defs: TYPE_DEFS }), { cache });
      expect(fetch.cache).to.equal(cache);
    });

    it('does not double-wrap an existing cached fetcher', () => {
      const fetch1 = TypeCache.wrapFetch(testFetch({ defs: TYPE_DEFS }));
      const fetch2 = TypeCache.wrapFetch(fetch1);
      expect(fetch1).to.equal(fetch2); // NB: instance re-used.
    });

    it('exists', async () => {
      const fetch = TypeCache.wrapFetch(testFetch({ defs: TYPE_DEFS }));
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

    describe('namespace', () => {
      it('getNs', async () => {
        const fetch = TypeCache.wrapFetch(testFetch({ defs: TYPE_DEFS }));
        const ns = 'ns:foo';
        const res1 = await fetch.getNs({ ns });
        const res2 = await fetch.getNs({ ns });
        expect(res1).to.not.eql(undefined);
        expect(res1).to.equal(res2);
        expect(fetch.cache.exists(fetch.cacheKey('getNs', ns))).to.eql(true);
      });

      it('getNs (parallel)', async () => {
        const fetch = TypeCache.wrapFetch(testFetch({ defs: TYPE_DEFS }));
        const ns = 'ns:foo';
        const method = fetch.getNs;
        const [res1, res2] = await Promise.all([method({ ns }), method({ ns })]);
        expect(res1).to.not.eql(undefined);
        expect(res1).to.equal(res2);
        expect(fetch.cache.exists(fetch.cacheKey('getNs', ns))).to.eql(true);
      });
    });

    describe('column', () => {
      it('getColumns', async () => {
        const fetch = TypeCache.wrapFetch(testFetch({ defs: TYPE_DEFS }));
        const ns = 'ns:foo';
        const res1 = await fetch.getColumns({ ns });
        const res2 = await fetch.getColumns({ ns });
        expect(res1).to.not.eql(undefined);
        expect(res1).to.equal(res2);
        expect(fetch.cache.exists(fetch.cacheKey('getColumns', ns))).to.eql(true);
      });
    });

    describe('cell', () => {
      it('getCells', async () => {
        const innerFetch = testFetch({ defs: TYPE_DEFS, cells: CELLS });
        const fetch = TypeCache.wrapFetch(innerFetch);

        const ns = 'ns:foo';

        const res1 = await fetch.getCells({ ns, query: 'B1:B3' });
        expect(Object.keys(res1.cells || {})).to.eql(['B2']);
        expect(innerFetch.getCellsCount).to.eql(1);

        const res2 = await fetch.getCells({ ns, query: 'B1:B3' });
        expect(res2).to.eql(res1);
        expect(innerFetch.getCellsCount).to.eql(1); // NB: Cached - fetch count not incremented.

        const res3 = await fetch.getCells({ ns, query: '1:50' });
        expect(Object.keys(res3.cells || {})).to.eql(['A1', 'Z1', 'B2', 'C3', 'Z9']);
        expect(innerFetch.getCellsCount).to.eql(2); // NB: Went back to the fetch source as query expanded range.
      });
    });
  });

  describe('TypeCacheCells', () => {
    const fetch = testFetch({
      defs: TYPE_DEFS,
      cells: CELLS,
    });

    it('create (constructor)', () => {
      const entry = TypeCacheCells.create('ns:foo');
      expect(entry.ns).to.eql('ns:foo');
      expect(entry.cells).to.eql({});
      expect(entry.error).to.eql(undefined);
    });

    describe('query', () => {
      it('query', () => {
        const entry = TypeCacheCells.create('ns:foo');
        const query = entry.query('1:500');
        expect(query.toString()).to.eql('1:500');
      });

      it('query.exists (pre-calculate from retrieved cells via [get])', async () => {
        const entry = TypeCacheCells.create('ns:foo');

        const query1 = entry.query('1:2');
        expect(query1.exists).to.eql(false);

        const res1 = await query1.get(fetch);
        expect(Object.keys(res1.cells || {})).to.eql(['A1', 'Z1', 'B2']);
        expect(query1.exists).to.eql(true);

        const query2 = entry.query('1:2');
        expect(query2.exists).to.eql(true); // NB: Existence determined from prior [get] call on [query1].

        const query3 = entry.query('Z9');
        expect(query3.exists).to.eql(false);
        await query3.get(fetch);
        expect(query3.exists).to.eql(true);
        expect(Object.keys(entry.cells)).to.eql(['A1', 'Z1', 'B2', 'Z9']);
      });

      it('query.get (pulls full rows, adds to cached {cells})', async () => {
        const entry = TypeCacheCells.create('ns:foo');
        expect(entry.cells).to.eql({});
        expect(entry.total.rows).to.eql(0);

        const res = await entry.query('B2:B3').get(fetch);

        expect(Object.keys(res.cells || {})).to.eql(['B2']); //         NB: Subset of query filter.
        expect(Object.keys(entry.cells)).to.eql(['B2', 'C3']); // NB: Complete rows (with row-9 not included within query)
        expect(entry.total.rows).to.eql(9);
        expect(entry.error).to.eql(undefined);
      });

      it('query.get (cached results returned)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS, cells: CELLS });
        const entry = TypeCacheCells.create('ns:foo');

        const query1 = entry.query('1:2');
        expect(query1.exists).to.eql(false);

        const res1 = await query1.get(fetch);
        expect(fetch.getCellsCount).to.eql(1);
        expect(Object.keys(res1.cells || {})).to.eql(['A1', 'Z1', 'B2']);
        expect(res1.error).to.eql(undefined);
        expect(res1.total.rows).to.eql(9);

        const res2 = await query1.get(fetch);
        expect(fetch.getCellsCount).to.eql(1); // NB: fetch count not increased because cached cells returned.
        expect(res2).to.eql(res1);

        const query2 = entry.query('1:2'); // NB: Same query as query1, but new instance.
        const res3 = await query2.get(fetch);
        expect(fetch.getCellsCount).to.eql(1); // NB: fetch count not increased because cached cells returned.
        expect(res3).to.eql(res1);

        const query3 = entry.query('1:500'); // NB: Expand query.
        const res4 = await query3.get(fetch);
        expect(fetch.getCellsCount).to.eql(2); // NB: fetch called again
        expect(Object.keys(res4.cells || {})).to.eql(['A1', 'Z1', 'B2', 'C3', 'Z9']);
      });

      it('query.get (cached results, single item - B1:B3)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS, cells: CELLS });
        const entry = TypeCacheCells.create('ns:foo');

        const query = entry.query('B1:B3');
        expect(query.exists).to.eql(false);

        const res1 = await query.get(fetch);

        expect(Object.keys(entry.cells)).to.eql(['A1', 'Z1', 'B2', 'C3']);
        expect(Object.keys(res1.cells || {})).to.eql(['B2']);

        expect(query.exists).to.eql(true);
        expect(fetch.getCellsCount).to.eql(1);

        const res2 = await query.get(fetch);
        expect(fetch.getCellsCount).to.eql(1); // NB: Not incremented - pulled from memory cache.
        expect(res2).to.eql(res1);
      });
    });
  });
});
