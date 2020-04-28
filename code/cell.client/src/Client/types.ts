import { t } from '../common';
export * from '../common/types';

export type ClientHttpInput = string | number | t.IHttpClientOptions;
export type ClientOptions = {
  http?: ClientHttpInput | t.IHttpClient;
  cache?: t.IMemoryCache;
  event$?: t.Subject<t.TypedSheetEvent>;
};
