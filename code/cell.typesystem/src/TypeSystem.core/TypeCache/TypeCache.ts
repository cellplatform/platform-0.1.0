import { MemoryCache, t } from '../../common';
import { fetcher } from '../../TypeSystem.util';

/**
 * Cache key generators.
 */
export class TypeCacheKey {
  public static fetch: t.CacheFetchKey = (method, ns, ...path) => {
    const suffix = path.length === 0 ? '' : `/${path.join('/')}`;
    return `TypeSystem/fetch/${ns}/${method}${suffix}`;
  };

  public static default: t.CacheDefaultValue = uri => {
    return `TypeSystem/default/${uri}`;
  };
}

/**
 * TypeSystem Cache.
 */
export class TypeCache {
  public static create = () => {
    return MemoryCache.create();
  };

  public static toCache = (cache?: t.IMemoryCache) => {
    return cache || TypeCache.create();
  };

  public static key = TypeCacheKey;

  /**
   * Cache enable a data-fetcher.
   */
  public static fetch(fetch: t.ISheetFetcher, options: { cache?: t.IMemoryCache } = {}) {
    if ((fetch as t.CachedFetcher).cache instanceof MemoryCache) {
      return fetch as t.CachedFetcher;
    }

    const cache = TypeCache.toCache(options.cache);
    const cacheKey = TypeCache.key.fetch;

    const getNs: t.FetchSheetNs = async args => {
      const key = cacheKey('getNs', args.ns.toString());
      return cache.exists(key) ? cache.get(key) : cache.put(key, fetch.getNs(args)).get(key);
    };

    const getColumns: t.FetchSheetColumns = async args => {
      const key = cacheKey('getColumns', args.ns.toString());
      return cache.exists(key) ? cache.get(key) : cache.put(key, fetch.getColumns(args)).get(key);
    };

    const getCells: t.FetchSheetCells = async args => {
      const key = cacheKey('getCells', args.ns.toString(), args.query);
      return cache.exists(key) ? cache.get(key) : cache.put(key, fetch.getCells(args)).get(key);
    };

    const res: t.CachedFetcher = {
      cache,
      cacheKey,
      ...fetcher.fromFuncs({ getNs, getColumns, getCells }),
    };

    return res;
  }
}
