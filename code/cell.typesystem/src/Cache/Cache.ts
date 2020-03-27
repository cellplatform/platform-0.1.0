import { MemoryCache, t } from '../common';
import { fetcher } from '../util/util.fetch';

type FetchMethod = 'getType' | 'getColumns' | 'getCells';
export type CacheFetchKey = (method: FetchMethod, ns: string, ...path: string[]) => string;
export type CachedFetcher = t.ISheetFetcher & { cache: t.IMemoryCache; cacheKey: CacheFetchKey };

/**
 * TypeSystem Cache.
 */
export class Cache {
  public static toCache = (cache?: t.IMemoryCache) => {
    return cache || MemoryCache.create();
  };

  /**
   * Cache enable a data-fetcher.
   */
  public static fetch(fetch: t.ISheetFetcher, options: { cache?: t.IMemoryCache } = {}) {
    const cache = Cache.toCache(options.cache);
    const cacheKey: CacheFetchKey = (method, ns, ...path) => {
      const suffix = path.length === 0 ? '' : `/${path.join('/')}`;
      return `TypeSystem/fetch/${ns}/${method}${suffix}}`;
    };

    const getType: t.FetchSheetType = async args => {
      const key = cacheKey('getType', args.ns);
      return cache.exists(key) ? cache.get(key) : cache.put(key, fetch.getType(args)).get(key);
    };

    const getColumns: t.FetchSheetColumns = async args => {
      const key = cacheKey('getColumns', args.ns);
      return cache.exists(key) ? cache.get(key) : cache.put(key, fetch.getColumns(args)).get(key);
    };

    const getCells: t.FetchSheetCells = async args => {
      const key = cacheKey('getCells', args.ns, args.query);
      return cache.exists(key) ? cache.get(key) : cache.put(key, fetch.getCells(args)).get(key);
    };

    const res: CachedFetcher = {
      cache,
      cacheKey,
      ...fetcher.fromFuncs({ getType, getColumns, getCells }),
    };

    return res;
  }
}
