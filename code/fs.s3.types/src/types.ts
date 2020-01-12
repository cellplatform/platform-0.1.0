import { Json } from '@platform/types';
type IHttpHeaders = { [key: string]: string | number };

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
  url(bucket: string, path?: string): S3Url;
  list(args: { bucket: string; prefix?: string; max?: number }): S3List;
  get(args: { bucket: string; key: string }): Promise<S3GetResponse>;
  put(args: S3PutArgs): Promise<S3PutResponse>;
  post(args: S3SignedPostArgs): S3SignedPost;
  deleteOne(args: { bucket: string; key: string }): Promise<S3DeleteOneResponse>;
  deleteMany(args: { bucket: string; keys: string[] }): Promise<S3DeleteManyResponse>;
  bucket(name: string): S3Bucket;
};

export type S3Url = {
  object: string;
  signedGet(options?: S3SignedUrlGetObjectOptions): string;
  signedPut(options?: S3SignedUrlPutObjectOptions): string;
  signedPost(options?: S3SignedPostOptions): S3SignedPostUrl;
};

export type S3Bucket = {
  endpoint: string;
  url(path?: string): S3Url;
  list(args: { prefix?: string; max?: number }): S3List;
  get(args: { key: string }): Promise<S3GetResponse>;
  put(args: S3BucketPutArgs): Promise<S3PutResponse>;
  post(args: S3SignedPostBucketArgs): S3SignedPost;
  deleteOne(args: { key: string }): Promise<S3DeleteOneResponse>;
  deleteMany(args: { keys: string[] }): Promise<S3DeleteManyResponse>;
};

export type S3SignedUrlArgs = S3SignedUrlGetObjectArgs | S3SignedUrlPutObjectArgs;
export type S3SignedUrlGetObjectArgs = S3SignedUrlGetObjectOptions & {
  operation: 'getObject';
};
export type S3SignedUrlGetObjectOptions = {
  seconds?: number;
};

export type S3SignedUrlPutObjectArgs = S3SignedUrlPutObjectOptions & {
  operation: 'putObject';
};
export type S3SignedUrlPutObjectOptions = {
  seconds?: number;
  body?: Buffer;
  md5?: string;
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
};

/**
 * Put
 */
export type S3PutArgs = S3BucketPutArgs & { bucket: string };
export type S3BucketPutArgs = {
  key: string;
  data: Buffer;
  acl?: S3Permissions;
  contentType?: string;
  contentDisposition?: string;
};

export type S3PutResponse = {
  ok: boolean;
  status: number;
  key: string;
  bucket: string;
  url: string;
  contentType: string;
  etag: string;
  error?: Error;
};

/**
 * Post (form data)
 */
export type S3ByteSizeRange = { min: number; max: number };

export type S3SignedPostArgs = S3SignedPostBucketArgs & { bucket: string };
export type S3SignedPostBucketArgs = S3SignedPostOptions & { key: string };
export type S3SignedPostOptions = {
  acl?: S3Permissions;
  contentType?: string;
  contentDisposition?: string;
  size?: S3ByteSizeRange;
  seconds?: number;
};

export type S3SignedPostUrl = {
  url: string;
  props: { [key: string]: string };
};
export type S3SignedPost = {
  url: { form: string; object: string };
  props: { [key: string]: string };
  send: (data: Buffer, options?: { headers?: IHttpHeaders }) => Promise<S3PostResponse>;
};
export type S3PostResponse = {
  ok: boolean;
  status: number;
  key: string;
  bucket: string;
  url: string;
  contentType: string;
  bytes: number;
  etag: string;
  error?: Error;
};

/**
 * Delete
 */
export type S3DeleteOneResponse = {
  ok: boolean;
  status: number;
  key: string;
  bucket: string;
  error?: Error;
};
export type S3DeleteManyResponse = {
  ok: boolean;
  status: number;
  keys: string[];
  bucket: string;
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
