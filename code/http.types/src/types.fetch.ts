import { t, Json } from './common';

export type HttpFetch = (req: t.IHttpRequestPayload) => Promise<t.IHttpFetchResponse>;

export type IHttpFetchResponse = {
  status: number;
  statusText?: string;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
  json(): Promise<Json>;
};
