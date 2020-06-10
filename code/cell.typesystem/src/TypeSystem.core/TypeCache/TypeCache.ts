import { MemoryCache, t } from '../../common';
import { wrap } from './TypeCache.wrap';
import { TypeCacheKey } from './TypeCacheKey';

/**
 * TypeSystem cache tools.
 */
export class TypeCache {
  public static create = (cache?: t.IMemoryCache) => cache || MemoryCache.create();
  public static key = TypeCacheKey;
  public static wrap = wrap;
}
