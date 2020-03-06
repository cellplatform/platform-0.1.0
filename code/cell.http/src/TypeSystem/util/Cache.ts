import { MemoryCache, t } from '../common';

export class Cache {
  public static toKey = (uri: string) => `TypeClient/${uri}`;
  public static toCache = (cache?: t.IMemoryCache) => cache || MemoryCache.create();
}
