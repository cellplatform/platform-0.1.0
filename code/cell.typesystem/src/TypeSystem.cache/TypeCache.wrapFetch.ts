import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MemoryCache, rx, t } from '../common';
import { fetcher } from '../TypeSystem.fetch';
import { TypeCacheCells } from './TypeCacheCells';
import { TypeCacheKey } from './TypeCacheKey';

/**
 * Determine if the given [fetch] object is "cache wrapped".
 */
export function isWrapped(fetch: t.ISheetFetcher) {
  return (fetch as t.CachedFetcher).cache instanceof MemoryCache;
}

/**
 * Cache enable a data-fetcher.
 */
export function wrapFetch(
  fetch: t.ISheetFetcher,
  options: { cache?: t.IMemoryCache; event$?: Subject<t.TypedSheetEvent> } = {},
) {
  if (isWrapped(fetch)) {
    return fetch as t.CachedFetcher;
  }

  type C = TypeCacheCells;
  const { cache = MemoryCache.create(), event$ } = options;
  const fetchKey = TypeCacheKey.fetch;

  // Patch cache on sync events.
  if (event$) {
    rx.payload<t.ITypedSheetSyncEvent>(event$, 'SHEET/sync').subscribe((e) => {
      const key = fetchKey('getCells', e.changes.uri);
      const entry = cache.get<C>(key);
      if (entry) {
        entry.total.rows = -1;
        entry.sync(e.changes);
      }
    });
  }

  const getNs: t.FetchSheetNs = async (args) => {
    const key = fetchKey('getNs', args.ns.toString());
    if (cache.exists(key)) {
      return cache.get(key);
    } else {
      const res = await fetch.getNs(args);
      if (res.ns && !res.error) {
        cache.put(key, res); // NB: Only cache if result found without error.
      }
      return res;
    }
  };

  const getColumns: t.FetchSheetColumns = async (args) => {
    const key = fetchKey('getColumns', args.ns.toString());
    if (cache.exists(key)) {
      return cache.get(key);
    } else {
      const res = await fetch.getColumns(args);
      if (res.columns && !res.error) {
        cache.put(key, res); // NB: Only cache if result found without error.
      }
      return res;
    }
  };

  const getCells: t.FetchSheetCells = async (args) => {
    const key = fetchKey('getCells', args.ns.toString());
    const cells = cache.exists(key)
      ? cache.get<C>(key)
      : cache.put(key, TypeCacheCells.create(args.ns)).get<C>(key);
    const res = await cells.query(args.query).get(fetch);
    if (res.error || !res.cells || Object.keys(res.cells).length === 0) {
      cache.delete(key); // NB: Only cache if result found without error.
    }
    return res;
  };

  const res: t.CachedFetcher = {
    cache,
    cacheKey: fetchKey,
    ...fetcher.fromFuncs({ getNs, getColumns, getCells }),
  };

  return res;
}
