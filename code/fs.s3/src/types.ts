import { Json } from '@platform/types';

export type S3Permissions = 'private' | 'public-read' | 'public-read-write';

export type IS3GetResponse = {
  ok: boolean;
  key: string;
  modifiedAt: number;
  etag?: string;
  error?: Error;
  content: { type: string; length: number };
  data?: Buffer;
  json: Json;
  save(path: string): Promise<{}>;
};

export type IS3PutResponse = {
  ok: boolean;
  key: string;
  bucket: string;
  url?: string;
  etag?: string;
  error?: Error;
};
