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
