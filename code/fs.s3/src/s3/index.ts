import { AWS, t } from '../common';
import { get } from './get';
import { put } from './put';
import { list } from './list';

export * from './get';
export * from './put';

export function init(args: { endpoint: string; accessKey: string; secret: string }): t.S3 {
  const { endpoint } = args;
  const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(endpoint) as any,
    accessKeyId: args.accessKey,
    secretAccessKey: args.secret,
  });

  const res: t.S3 = {
    endpoint,

    get(args: { bucket: string; key: string }) {
      return get({ ...args, s3 });
    },

    put(args: { bucket: string; key: string; source: string | Buffer; acl?: t.S3Permissions }) {
      return put({ ...args, s3 });
    },

    list(args: { bucket: string; prefix?: string; max?: number }) {
      return list({ ...args, s3 });
    },

    bucket(name: string) {
      const bucket = name;
      return {
        bucket,
        endpoint,
        get(args: { key: string }) {
          return res.get({ ...args, bucket });
        },
        put(args: { key: string; source: string | Buffer; acl?: t.S3Permissions }) {
          return res.put({ ...args, bucket });
        },
        list(args: { prefix?: string; max?: number }) {
          return res.list({ ...args, bucket });
        },
      };
    },
  };

  return res;
}
