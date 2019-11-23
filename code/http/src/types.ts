export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH';

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
  body: string;
  json<T = any>(): T;
};
