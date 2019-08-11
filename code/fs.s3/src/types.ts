import { Json } from '@platform/types';

export type S3Permissions = 'private' | 'public-read' | 'public-read-write';

export type S3GetResponse = {
  ok: boolean;
  status: number;
  key: string;
  modifiedAt: number;
  etag?: string;
  error?: Error;
  content: { type: string; length: number };
  data?: Buffer;
  json: Json;
  save(path: string): Promise<{}>;
};

export type S3PutResponse = {
  ok: boolean;
  status: number;
  key: string;
  bucket: string;
  url?: string;
  etag?: string;
  error?: Error;
};

export type S3 = {
  endpoint: string;
  get(args: { bucket: string; key: string }): Promise<S3GetResponse>;
  put(args: {
    bucket: string;
    key: string;
    source: string | Buffer;
    acl?: S3Permissions;
  }): Promise<S3PutResponse>;
  bucket(name: string): S3Bucket;
};

export type S3Bucket = {
  endpoint: string;
  get(args: { key: string }): Promise<S3GetResponse>;
  put(args: { key: string; source: string | Buffer; acl?: S3Permissions }): Promise<S3PutResponse>;
};
