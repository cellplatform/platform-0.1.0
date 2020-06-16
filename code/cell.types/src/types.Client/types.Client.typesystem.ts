import { t } from '../common';

type N = string | t.INsUri;

export type IClientTypesystem = {
  readonly host: string;
  readonly http: t.IHttpClient;
  readonly fetch: t.ISheetFetcher;
  readonly cache: t.IMemoryCache;
  readonly changes: t.ITypedSheetChangeMonitor;
  readonly pool?: t.ISheetPool;
  sheet<T>(ns: N): Promise<t.ITypedSheet<T>>;
  defs(ns: N | N[]): Promise<t.INsTypeDef[]>;
  typescript(
    ns: N | N[],
    options?: { header?: boolean; exports?: boolean; imports?: boolean },
  ): Promise<t.ITypeClientTypescript>;
};
