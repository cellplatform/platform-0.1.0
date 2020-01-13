import { Json } from '@platform/types';

export type IHttpHeaders = { [key: string]: string | number };

export type IFetchOptions = {
  headers?: IHttpHeaders;
  mode?: 'cors' | 'no-cors' | 'same-origin';
};

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

export type HttpCreate = (options?: IFetchOptions) => IHttp;
export type IHttp = IHttpMethods & { create: HttpCreate; headers: IHttpHeaders };
export type IHttpMethods = {
  head(url: string, options?: IFetchOptions): Promise<IHttpResponse>;
  get(url: string, options?: IFetchOptions): Promise<IHttpResponse>;
  put(url: string, data?: any, options?: IFetchOptions): Promise<IHttpResponse>;
  post(url: string, data?: any, options?: IFetchOptions): Promise<IHttpResponse>;
  patch(url: string, data?: any, options?: IFetchOptions): Promise<IHttpResponse>;
  delete(url: string, data?: any, options?: IFetchOptions): Promise<IHttpResponse>;
};
