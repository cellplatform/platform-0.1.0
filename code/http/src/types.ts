import { Json } from '@platform/types';

export type IHttpHeaders = { [key: string]: string | number };

export type IFetchOptions = {
  headers?: IHttpHeaders;
  mode?: 'cors' | 'no-cors' | 'same-origin';
};

export type IHttpResponse = {
  status: number;
  statusText: string;
  ok: boolean;
  headers: IHttpHeaders;
  body: string;
  json<T extends Json = any>(): T;
};
