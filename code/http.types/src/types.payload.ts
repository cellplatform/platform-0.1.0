import { t, Json } from './common';

/**
 * Request
 */
export type IHttpRequestPayload = {
  url: string;
  method: t.HttpMethod;
  mode?: t.HttpCors;
  headers?: t.IHttpHeaders;
  data?: object | string;
};

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
  is: {
    json: boolean;
    text: boolean;
    binary: boolean;
  };
};

/**
 * Respond (method)
 */
export type IHttpRespondPayload = {
  status: number;
  statusText?: string;
  headers?: t.IHttpHeaders;
  data?: ReadableStream<Uint8Array> | object | string;
};
