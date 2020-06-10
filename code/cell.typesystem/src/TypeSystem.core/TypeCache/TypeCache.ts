import { MemoryCache } from '../../common';
import { wrap, toCache } from './TypeCache.fetch';
import { TypeCacheKey } from './TypeCacheKey';

/**
 * TypeSystem Cache.
 */
export class TypeCache {
  public static create = () => MemoryCache.create();
  public static toCache = toCache;
  public static key = TypeCacheKey;
  public static wrap = wrap;
}
