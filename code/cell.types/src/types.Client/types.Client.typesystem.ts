import { Subject } from 'rxjs';
import { t } from '../common';

type N = string | t.INsUri;
type E = t.TypedSheetEvent;
type SaveResponse = { ok: boolean; changes: t.ITypedSheetChanges; error?: t.IHttpError };
type Fire = t.FireEvent<E> | Subject<E>;

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
  saveChanges(sheet: t.ITypedSheet, options?: { fire?: Fire }): Promise<SaveResponse>;
};

export type IClientTypesystemImplements = {
  ns: string;
  implements: string;
  typeDefs: t.INsTypeDef[];
  error?: t.IHttpError;
};
