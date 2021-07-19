import { t, Observable } from './common';

/**
 * Client (HTTP)
 */
export type HttpCors = 'cors' | 'no-cors' | 'same-origin';
export type HttpCreate = (options?: HttpCreateOptions) => IHttp;

export type HttpCreateOptions = HttpOptions & { fetch?: t.HttpFetch };
export type HttpOptions = { headers?: t.HttpHeaders; mode?: HttpCors };

export type IHttp = HttpMethods & {
  create: HttpCreate;
  headers: t.HttpHeaders;
  events$: Observable<t.HttpEvent>;
  before$: Observable<t.HttpBefore>;
  after$: Observable<t.HttpAfter>;
};

export type HttpMethods = {
  head(url: string, options?: HttpOptions): Promise<t.HttpResponse>;
  get(url: string, options?: HttpOptions): Promise<t.HttpResponse>;
  put(url: string, data?: any, options?: HttpOptions): Promise<t.HttpResponse>;
  post(url: string, data?: any, options?: HttpOptions): Promise<t.HttpResponse>;
  patch(url: string, data?: any, options?: HttpOptions): Promise<t.HttpResponse>;
  delete(url: string, data?: any, options?: HttpOptions): Promise<t.HttpResponse>;
};
