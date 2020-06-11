import { MemoryCache, t } from '../../common';
import { fetcher } from '../../TypeSystem.util';
import { TypeCacheKey } from './TypeCacheKey';
import { TypeCacheCells } from './TypeCacheCells';

/**
 * Determine if the given [fetch] object is "cache wrapped"/
 */
export function isWrapped(fetch: t.ISheetFetcher) {
  return (fetch as t.CachedFetcher).cache instanceof MemoryCache;
}

/**
 * Cache enable a data-fetcher.
 */
export function wrapFetch(fetch: t.ISheetFetcher, options: { cache?: t.IMemoryCache } = {}) {
  if (isWrapped(fetch)) {
    return fetch as t.CachedFetcher;
  }

  const cache = options.cache || MemoryCache.create();
  const fetchKey = TypeCacheKey.fetch;

  const getNs: t.FetchSheetNs = async (args) => {
    const key = fetchKey('getNs', args.ns.toString());
    return cache.exists(key) ? cache.get(key) : cache.put(key, fetch.getNs(args)).get(key);
  };

  const getColumns: t.FetchSheetColumns = async (args) => {
    const key = fetchKey('getColumns', args.ns.toString());
    return cache.exists(key) ? cache.get(key) : cache.put(key, fetch.getColumns(args)).get(key);
  };

  const getCells: t.FetchSheetCells = async (args) => {
    const key = fetchKey('getCells', args.ns.toString());
    type T = TypeCacheCells;
    const cells = cache.exists(key)
      ? cache.get<T>(key)
      : cache.put(key, TypeCacheCells.create(args.ns)).get<T>(key);
    return cells.query(args.query).get(fetch);
  };

  const res: t.CachedFetcher = {
    cache,
    cacheKey: fetchKey,
    ...fetcher.fromFuncs({ getNs, getColumns, getCells }),
  };

  return res;
}
