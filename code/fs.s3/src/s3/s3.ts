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

  const toEndpointUrl = (type: t.S3EndpointKind) => {
    const url = endpoint[type];
    return url || endpoint.origin;
  };

  const getS3: t.GetAwsS3 = (endpoint) => {
    return new AWS.S3({
      endpoint: new AWS.Endpoint(toEndpointUrl(endpoint)),
      accessKeyId: args.accessKey,
      secretAccessKey: args.secret,
    });
  };

  const res: t.S3 = {
    endpoint,

    url(bucket, path, options = {}) {
      const { endpoint } = options;
      return url({ getS3, bucket, path, endpoint });
    },

    list(args) {
      const s3 = getS3('origin');
      return list({ ...args, s3 });
    },

    get(args) {
      const s3 = getS3('origin');
      return get({ ...args, s3 });
    },

    put(args) {
      const s3 = getS3('origin');
      return put({ ...args, s3 });
    },

    post(args) {
      const s3 = getS3('origin');
      return post({ ...args, s3 });
    },

    deleteOne(args) {
      const s3 = getS3('origin');
      return deleteOne({ ...args, s3 });
    },

    deleteMany(args) {
      const s3 = getS3('origin');
      return deleteMany({ ...args, s3 });
    },

    copy(args) {
      const s3 = getS3('origin');
      return copy({ ...args, s3 });
    },

    bucket(name: string) {
      const bucket = name;
      return {
        bucket,
        endpoint,
        url(path: string, options) {
          return res.url(bucket, path, options);
        },
        list(args) {
          return res.list({ ...args, bucket });
        },
        get(args) {
          return res.get({ ...args, bucket });
        },
        put(args) {
          return res.put({ ...args, bucket });
        },
        post(args) {
          return res.post({ ...args, bucket });
        },
        deleteOne(args) {
          return res.deleteOne({ ...args, bucket });
        },
        deleteMany(args) {
          return res.deleteMany({ ...args, bucket });
        },
        copy(args) {
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
