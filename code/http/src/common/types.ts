import { HttpEvent } from '../types';
export { Json } from '@platform/types';

export * from '../types';

export type FireEvent = (e: HttpEvent) => void;

export type IHttpResponseLike = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
};
