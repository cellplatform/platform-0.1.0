import { t, Json } from './common';

/**
 * Response
 */
export type IHttpResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: t.IHttpHeaders;
  contentType: IHttpContentType;
  body?: ReadableStream<Uint8Array>;
  text: string;
  json: Json;
};

export type IHttpContentType = {
  value: string;
  is: IHttpContentIs;
};
export type IHttpContentIs = {
  json: boolean;
  text: boolean;
  binary: boolean;
};

export type IHttpRespondPayload = {
  status: number;
  statusText?: string;
  headers?: t.IHttpHeaders;
  data?: ReadableStream<Uint8Array> | object | string;
};
