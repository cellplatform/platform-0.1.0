import * as t from './common/types';

import { Observable } from 'rxjs';

export type IHttpHeaders = t.IHttpHeaders;
export type HttpMode = 'cors' | 'no-cors' | 'same-origin';
export type IFetchOptions = {
  headers?: IHttpHeaders;
  mode?: HttpMode;
};

export type IHttpResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: IHttpHeaders;
  contentType: IHttpContentType;
  body?: ReadableStream<Uint8Array>;
  text: string;
  json: t.Json;
};

export type IHttpContentType = {
  value: string;
  is: {
    json: boolean;
    text: boolean;
    binary: boolean;
  };
};

/**
 * Client
 */
export type HttpCreate = (options?: IFetchOptions) => IHttp;

export type IHttp = IHttpMethods & {
  create: HttpCreate;
  headers: IHttpHeaders;
  events$: Observable<HttpEvent>;
  before$: Observable<IHttpBefore>;
  after$: Observable<IHttpAfter>;
};

export type IHttpMethods = {
  head(url: string, options?: IFetchOptions): Promise<IHttpResponse>;
  get(url: string, options?: IFetchOptions): Promise<IHttpResponse>;
  put(url: string, data?: any, options?: IFetchOptions): Promise<IHttpResponse>;
  post(url: string, data?: any, options?: IFetchOptions): Promise<IHttpResponse>;
  patch(url: string, data?: any, options?: IFetchOptions): Promise<IHttpResponse>;
  delete(url: string, data?: any, options?: IFetchOptions): Promise<IHttpResponse>;
};

/**
 * Events
 */

export type HttpEvent = IHttpBeforeEvent | IHttpAfterEvent;

export type IHttpBeforeEvent = { type: 'HTTP/before'; payload: IHttpBefore };
export type IHttpBefore = {
  eid: string;
  method: t.HttpMethod;
  url: string;
  data?: any;
  headers: IHttpHeaders;
  isModified: boolean;
  modify(args: { data?: any | Buffer; headers?: IHttpHeaders }): void;
  respond: t.EventRespond; // NB: Used for mocking/testing.
};

export type IHttpAfterEvent = { type: 'HTTP/after'; payload: IHttpAfter };
export type IHttpAfter = {
  eid: string;
  method: t.HttpMethod;
  url: string;
  response: IHttpResponse;
  elapsed: t.IDuration;
};
