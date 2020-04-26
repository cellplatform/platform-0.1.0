import * as t from '@platform/cell.types';
import { IMemoryCache } from '@platform/cache/lib/types';

export { IMemoryCache };
export { Subject, Observable } from 'rxjs';
export { IFs } from '@platform/fs.types';
export { Json } from '@platform/types';

export * from '@platform/cell.types';
export * from '../types';

export type IPackage = {
  name: string;
  version: string;
  dependencies?: { [key: string]: string };
};

/**
 * Cache
 */
type FetchMethod = 'getNs' | 'getColumns' | 'getCells';
export type CachedFetcher = t.ISheetFetcher & { cache: IMemoryCache; cacheKey: CacheFetchKey };
export type CacheFetchKey = (method: FetchMethod, ns: string, ...path: string[]) => string;
export type CacheDefaultValue = (uri: string) => string;
