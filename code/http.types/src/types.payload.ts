import { t, Json } from './common';

/**
 * Request
 */
export type HttpRequestPayload = {
  url: string;
  method: t.HttpMethod;
  mode?: t.HttpCors;
  headers?: t.HttpHeaders;
  data?: Record<string, unknown> | string;
};

/**
 * Response
 */
export type HttpResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: t.HttpHeaders;
  contentType: HttpContentType;
  body?: ReadableStream<Uint8Array>;
  text: string;
  json: Json;
};

export type HttpContentType = {
  mime: string;
  is: {
    json: boolean;
    text: boolean;
    binary: boolean;
  };
  toString(): string;
};

/**
 * Respond (method)
 */
export type HttpRespondPayload = {
  status: number;
  statusText?: string;
  headers?: t.HttpHeaders;
  data?: ReadableStream<Uint8Array> | Record<string, unknown> | string;
};
