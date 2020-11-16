import { AWS, t } from '../common';
import { copy } from './s3.copy';
import { deleteMany, deleteOne } from './s3.delete';
import { get } from './s3.get';
import { list } from './s3.list';
import { post } from './s3.post';
import { put } from './s3.put';
import { url } from './s3.url';

export * from './s3.get';
export * from './s3.put';
export * from './s3.post';
export * from './s3.copy';

export function init(args: t.S3Config): t.S3 {
  const endpoint = toEndpoint(args.endpoint);

  const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(endpoint.origin) as any,
    accessKeyId: args.accessKey,
    secretAccessKey: args.secret,
  });

  const res: t.S3 = {
    endpoint,

    url(bucket: string, path: string) {
      return url(s3, bucket, path);
    },

    list(args: { bucket: string; prefix?: string; max?: number }) {
      return list({ ...args, s3 });
    },

    get(args: { bucket: string; key: string; metaOnly?: boolean }) {
      return get({ ...args, s3 });
    },

    put(args: t.S3PutArgs) {
      return put({ ...args, s3 });
    },

    post(args: t.S3SignedPostArgs) {
      return post({ ...args, s3 });
    },

    deleteOne(args: { bucket: string; key: string }) {
      return deleteOne({ ...args, s3 });
    },

    deleteMany(args: { bucket: string; keys: string[] }) {
      return deleteMany({ ...args, s3 });
    },

    copy(args: t.S3CopyArgs) {
      return copy({ ...args, s3 });
    },

    bucket(name: string) {
      const bucket = name;
      return {
        bucket,
        endpoint,
        url(path: string) {
          return res.url(bucket, path);
        },
        list(args: { prefix?: string; max?: number }) {
          return res.list({ ...args, bucket });
        },
        get(args: { key: string; metaOnly?: boolean }) {
          return res.get({ ...args, bucket });
        },
        put(args: t.S3BucketPutArgs) {
          return res.put({ ...args, bucket });
        },
        post(args: t.S3SignedPostBucketArgs) {
          return res.post({ ...args, bucket });
        },
        deleteOne(args: { key: string }) {
          return res.deleteOne({ ...args, bucket });
        },
        deleteMany(args: { keys: string[] }) {
          return res.deleteMany({ ...args, bucket });
        },
        copy(args: t.S3BucketCopyArgs) {
          const source = { bucket, key: args.source };
          const target =
            typeof args.target === 'string' ? { bucket, key: args.target } : args.target;
          return res.copy({ ...args, source, target });
        },
      };
    },
  };

  return res;
}

/**
 * [Helpers]
 */

const toEndpoint = (input: string | t.S3Endpoint): t.S3Endpoint => {
  const origin = (typeof input === 'string' ? input : input.origin || '').trim();
  const edge = typeof input !== 'object' ? undefined : (input.edge || '').trim();
  return { origin, edge: edge || undefined };
};
