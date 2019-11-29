import { Json } from '@platform/types';

export type S3Config = {
  accessKey: string;
  secret: string;
  endpoint: string;
};

export type S3Permissions = 'private' | 'public-read' | 'public-read-write';
export type S3StorageClass =
  | 'STANDARD'
  | 'REDUCED_REDUNDANCY'
  | 'GLACIER'
  | 'STANDARD_IA'
  | 'ONEZONE_IA'
  | 'INTELLIGENT_TIERING'
  | 'DEEP_ARCHIVE';

export type S3 = {
  endpoint: string;
  get(args: { bucket: string; key: string }): Promise<S3GetResponse>;
  put(args: {
    bucket: string;
    key: string;
    source: string | Buffer;
    acl?: S3Permissions;
  }): Promise<S3PutResponse>;
  list(args: { bucket: string; prefix?: string; max?: number }): S3List;
  bucket(name: string): S3Bucket;
};

export type S3Bucket = {
  endpoint: string;
  get(args: { key: string }): Promise<S3GetResponse>;
  put(args: { key: string; source: string | Buffer; acl?: S3Permissions }): Promise<S3PutResponse>;
  list(args: { bucket: string; prefix?: string; max?: number }): S3List;
};

export type S3List = {
  objects: Promise<S3ListObjectsResponse>;
  dirs: Promise<S3ListDirsResponse>;
};

/**
 * Get
 */
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

/**
 * Put
 */
export type S3PutResponse = {
  ok: boolean;
  status: number;
  key: string;
  bucket: string;
  url?: string;
  etag?: string;
  error?: Error;
};

/**
 * List
 */
export type S3ListResponse = {
  ok: boolean;
  status: number;
  prefix: string;
  max: number;
  error?: Error;
};

export type S3ListObjectsResponse = S3ListResponse & { items: S3ListObject[] };
export type S3ListObject = {
  key: string;
  modifiedAt: number;
  etag: string;
  storage: S3StorageClass;
  owner: { id: string; displayName: string };
};

export type S3ListDirsResponse = S3ListResponse & { items: S3ListDir[] };
export type S3ListDir = { key: string };
