import { HttpEvent } from '../types';
import { Json } from '@platform/types';

export { Json };
export * from '../types';

export type FireEvent = (e: HttpEvent) => void;

export type IHttpResponseLike = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
  // json(): Promise<Json>;
};
