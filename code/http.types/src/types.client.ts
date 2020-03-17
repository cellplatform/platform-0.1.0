import { t, Observable } from './common';

/**
 * Client (HTTP)
 */
export type HttpCors = 'cors' | 'no-cors' | 'same-origin';
export type HttpOptions = { headers?: t.IHttpHeaders; mode?: HttpCors };
export type HttpCreate = (options?: HttpOptions) => IHttp;

export type IHttp = IHttpMethods & {
  create: HttpCreate;
  headers: t.IHttpHeaders;
  events$: Observable<t.HttpEvent>;
  before$: Observable<t.IHttpBefore>;
  after$: Observable<t.IHttpAfter>;
};

export type IHttpMethods = {
  head(url: string, options?: HttpOptions): Promise<t.IHttpResponse>;
  get(url: string, options?: HttpOptions): Promise<t.IHttpResponse>;
  put(url: string, data?: any, options?: HttpOptions): Promise<t.IHttpResponse>;
  post(url: string, data?: any, options?: HttpOptions): Promise<t.IHttpResponse>;
  patch(url: string, data?: any, options?: HttpOptions): Promise<t.IHttpResponse>;
  delete(url: string, data?: any, options?: HttpOptions): Promise<t.IHttpResponse>;
};

/**
 * Respond (Injection)
 */
export type HttpRespondMethod = (payload: HttpRespondMethodArg) => void;
export type HttpRespondMethodArg =
  | HttpRespondPayload
  | (() => HttpRespondPayload)
  | (() => Promise<HttpRespondPayload>);
export type HttpRespondPayload = {
  status: number;
  statusText?: string;
  headers?: t.IHttpHeaders;
  data?: object;
};
