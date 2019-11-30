import { AWS, t } from '../common';
import { get } from './s3.get';
import { put } from './s3.put';
import { list } from './s3.list';

export * from './s3.get';
export * from './s3.put';

export function init(args: t.S3Config): t.S3 {
  const endpoint = (args.endpoint || '').trim();
  const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(endpoint) as any,
    accessKeyId: args.accessKey,
    secretAccessKey: args.secret,
  });

  const res: t.S3 = {
    endpoint,

    url(bucket: string, path?: string) {
      bucket = (bucket || '')
        .trim()
        .replace(/^\.*/, '')
        .replace(/\.*$/, '');
      path = (path || '').trim().replace(/^\/*/, '');
      if (!bucket) {
        throw new Error(`No bucket provided.`);
      }
      return `https://${bucket}.${endpoint}/${path}`;
    },

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
        url(path?: string) {
          return res.url(bucket, path);
        },
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
