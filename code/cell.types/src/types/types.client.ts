import { t } from '../common';

type N = string | t.INsUri;

export type IClientTypesystem = {
  readonly http: t.IHttpClient;
  readonly fetch: t.ISheetFetcher;
  readonly changes: t.ITypedSheetChangeMonitor;
  defs(ns: N | N[]): Promise<t.INsTypeDef[]>;
  typescript(ns: N | N[]): Promise<t.ITypeClientTypescript>;
  sheet<T>(ns: N): Promise<t.ITypedSheet<T>>;
};
