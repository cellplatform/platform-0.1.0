import { MemoryCache, t } from '../../common';
import { wrapFetch } from './TypeCache.wrapFetch';
import { TypeCacheKey } from './TypeCacheKey';

/**
 * TypeSystem cache tools.
 */
export class TypeCache {
  public static create = (cache?: t.IMemoryCache) => cache || MemoryCache.create();
  public static key = TypeCacheKey;
  public static wrapFetch = wrapFetch;
}
