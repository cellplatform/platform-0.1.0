import { AWS, t, toContentType, util } from '../common';
import { deleteMany, deleteOne } from './s3.delete';
import { get } from './s3.get';
import { list } from './s3.list';
import { put } from './s3.put';
import { post } from './s3.post';

export * from './s3.get';
export * from './s3.put';
export * from './s3.post';

export function init(args: t.S3Config): t.S3 {
  const endpoint = (args.endpoint || '').trim();
  const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(endpoint) as any,
    accessKeyId: args.accessKey,
    secretAccessKey: args.secret,
  });

  const res: t.S3 = {
    toContentType,
    endpoint,

    url(bucket: string, path?: string) {
      return util.toObjectUrl({ s3, bucket, path });
    },

    list(args: { bucket: string; prefix?: string; max?: number }) {
      return list({ ...args, s3 });
    },

    get(args: { bucket: string; key: string }) {
      return get({ ...args, s3 });
    },

    put(args: {
      bucket: string;
      key: string;
      source: string | Buffer;
      acl?: t.S3Permissions;
      contentType?: string;
      contentDisposition?: string;
    }) {
      return put({ ...args, s3 });
    },

    post(args: {
      bucket: string;
      key: string;
      acl?: t.S3Permissions;
      contentType?: string;
      contentDisposition?: string;
      size?: t.S3ByteSizeRange;
      seconds?: number;
    }) {
      return post({ ...args, s3 });
    },

    deleteOne(args: { bucket: string; key: string }) {
      return deleteOne({ ...args, s3 });
    },

    deleteMany(args: { bucket: string; keys: string[] }) {
      return deleteMany({ ...args, s3 });
    },

    bucket(name: string) {
      const bucket = name;
      return {
        bucket,
        endpoint,
        url(path?: string, options?: t.S3PresignedUrlArgs) {
          return options
            ? util.toPresignedUrl({ s3, bucket, path, options })
            : res.url(bucket, path);
        },
        list(args: { prefix?: string; max?: number }) {
          return res.list({ ...args, bucket });
        },
        get(args: { key: string }) {
          return res.get({ ...args, bucket });
        },
        put(args: {
          key: string;
          source: string | Buffer;
          acl?: t.S3Permissions;
          contentType?: string;
          contentDisposition?: string;
        }) {
          return res.put({ ...args, bucket });
        },
        post(args: {
          key: string;
          acl?: t.S3Permissions;
          contentType?: string;
          contentDisposition?: string;
          size?: t.S3ByteSizeRange;
          seconds?: number;
        }) {
          return res.post({ ...args, bucket });
        },

        deleteOne(args: { key: string }) {
          return res.deleteOne({ ...args, bucket });
        },
        deleteMany(args: { keys: string[] }) {
          return res.deleteMany({ ...args, bucket });
        },
      };
    },
  };

  return res;
}
