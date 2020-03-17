import { Observable } from 'rxjs';
import { Json, IDuration } from '@platform/types';

export type HttpMethod = 'HEAD' | 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH' | 'OPTIONS';
export type IHttpHeaders = { [key: string]: string };

export type IHttpResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: IHttpHeaders;
  contentType: IHttpContentType;
  body?: ReadableStream<Uint8Array>;
  text: string;
  json: Json;
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
 * Client (HTTP)
 */
export type HttpMode = 'cors' | 'no-cors' | 'same-origin';
export type HttpOptions = { headers?: IHttpHeaders; mode?: HttpMode };
export type HttpCreate = (options?: HttpOptions) => IHttp;

export type IHttp = IHttpMethods & {
  create: HttpCreate;
  headers: IHttpHeaders;
  events$: Observable<HttpEvent>;
  before$: Observable<IHttpBefore>;
  after$: Observable<IHttpAfter>;
};

export type IHttpMethods = {
  head(url: string, options?: HttpOptions): Promise<IHttpResponse>;
  get(url: string, options?: HttpOptions): Promise<IHttpResponse>;
  put(url: string, data?: any, options?: HttpOptions): Promise<IHttpResponse>;
  post(url: string, data?: any, options?: HttpOptions): Promise<IHttpResponse>;
  patch(url: string, data?: any, options?: HttpOptions): Promise<IHttpResponse>;
  delete(url: string, data?: any, options?: HttpOptions): Promise<IHttpResponse>;
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
  headers?: IHttpHeaders;
  data?: object;
};

export type IHttpResponseLike = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
};

/**
 * Events
 */
export type HttpEvent = IHttpBeforeEvent | IHttpAfterEvent;

export type IHttpBeforeEvent = { type: 'HTTP/before'; payload: IHttpBefore };
export type IHttpBefore = {
  uid: string;
  method: HttpMethod;
  url: string;
  data?: any;
  headers: IHttpHeaders;
  isModified: boolean;
  modify(args: { data?: any | Buffer; headers?: IHttpHeaders }): void;
  respond: HttpRespondMethod; // NB: Used for mocking/testing or providing alternative `fetch` implementations.
};

export type IHttpAfterEvent = { type: 'HTTP/after'; payload: IHttpAfter };
export type IHttpAfter = {
  uid: string;
  method: HttpMethod;
  url: string;
  response: IHttpResponse;
  elapsed: IDuration;
};
