import { t, Observable } from './common';

/**
 * Client (HTTP)
 */
export type HttpCors = 'cors' | 'no-cors' | 'same-origin';
export type HttpCreate = (options?: IHttpCreateOptions) => IHttp;

export type IHttpCreateOptions = IHttpOptions & { fetch?: t.HttpFetch };
export type IHttpOptions = { headers?: t.IHttpHeaders; mode?: HttpCors };

export type IHttp = IHttpMethods & {
  create: HttpCreate;
  headers: t.IHttpHeaders;
  events$: Observable<t.HttpEvent>;
  before$: Observable<t.IHttpBefore>;
  after$: Observable<t.IHttpAfter>;
};

export type IHttpMethods = {
  head(url: string, options?: IHttpOptions): Promise<t.IHttpResponse>;
  get(url: string, options?: IHttpOptions): Promise<t.IHttpResponse>;
  put(url: string, data?: any, options?: IHttpOptions): Promise<t.IHttpResponse>;
  post(url: string, data?: any, options?: IHttpOptions): Promise<t.IHttpResponse>;
  patch(url: string, data?: any, options?: IHttpOptions): Promise<t.IHttpResponse>;
  delete(url: string, data?: any, options?: IHttpOptions): Promise<t.IHttpResponse>;
};
