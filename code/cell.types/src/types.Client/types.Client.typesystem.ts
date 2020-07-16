import { Subject } from 'rxjs';
import { t } from '../common';

type N = string | t.INsUri;
type E = t.TypedSheetEvent;

export type IClientTypesystem = {
  readonly host: string;
  readonly http: t.IHttpClient;
  readonly fetch: t.ISheetFetcher;
  readonly cache: t.IMemoryCache;
  readonly changes: t.ITypedSheetChangeMonitor;
  readonly pool?: t.ISheetPool;
  sheet<T>(ns: N): Promise<t.ITypedSheet<T>>;
  typeDefs(ns: N | N[]): Promise<t.INsTypeDef[]>;
  implements(ns: N): Promise<t.IClientTypesystemImplements>;
  typescript(
    ns: N | N[],
    options?: t.ITypeClientTypescriptOptions,
  ): Promise<t.ITypeClientTypescript>;
  saveChanges(args: {
    sheet: t.ITypedSheet;
    event$?: Subject<E>;
  }): Promise<{ ok: boolean; changes: t.ITypedSheetChanges; error?: t.IHttpError }>;
};

export type IClientTypesystemImplements = {
  ns: string;
  implements: string;
  typeDefs: t.INsTypeDef[];
  error?: t.IHttpError;
};
