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
    event$.pipe(filter((e) => e.type === 'SHEET/sync'));
    rx.payload<t.ITypedSheetSyncEvent>(event$, 'SHEET/sync').subscribe((e) => {
      const key = fetchKey('getCells', e.ns);
      const entry = cache.get<C>(key);
      entry.total.rows = -1;
      entry?.sync(e.changes);
    });
  }

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
    const cells = cache.exists(key)
      ? cache.get<C>(key)
      : cache.put(key, TypeCacheCells.create(args.ns)).get<C>(key);
    return cells.query(args.query).get(fetch);
  };

  const res: t.CachedFetcher = {
    cache,
    cacheKey: fetchKey,
    ...fetcher.fromFuncs({ getNs, getColumns, getCells }),
  };

  return res;
}
