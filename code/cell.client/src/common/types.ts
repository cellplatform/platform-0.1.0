import { IMemoryCache } from '@platform/cache/lib/types';
import * as t from '@platform/cell.types';
import { Subject } from 'rxjs';

export { Subject, IMemoryCache };

export * from '@platform/types';
export * from '@platform/cell.types';
export * from '@platform/http/lib/types';
export * from '@platform/http.types';

export * from '../MemoryQueue/types';
export * from '../types';

/**
 * Internal
 */

export type ClientHttpInput = string | number | t.IHttpClientOptions;
export type ClientOptions = {
  http?: ClientHttpInput | t.IHttpClient;
  cache?: IMemoryCache;
  event$?: Subject<t.TypedSheetEvent>;
};

export type ClientTypesystemOptions = ClientOptions & { pool?: t.ISheetPool };
