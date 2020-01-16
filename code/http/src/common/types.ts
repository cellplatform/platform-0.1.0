import * as t from '../types';

export * from '../types';
export { Json, HttpMethod, IDuration } from '@platform/types';

export type IHttpHeaders = { [key: string]: string | number };

export type ResponseLike = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
};

export type EventResponseOptions = {
  statusText?: string;
  headers?: IHttpHeaders;
  data?: object;
  delay?: number;
};
export type EventRespond = (status: number, options?: EventResponseOptions) => void;

export type Fire = (e: t.HttpEvent) => void;
