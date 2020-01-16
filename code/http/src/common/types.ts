import * as t from '../types';
import { Json, HttpMethod, IDuration, IHttpHeaders } from '@platform/types';

export { Json, HttpMethod, IDuration, IHttpHeaders };
export * from '../types';

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
