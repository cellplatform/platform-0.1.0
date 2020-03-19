import { t, fs, path, Schema, util } from '../common';

export * from '../types';
export type IS3Init = t.S3Config & { root: string };

/**
 * Initializes an "S3" compatible file-system API.
 * eg:
 *  - AWS "S3"
 *  - DigitalOcean "Spaces"
 */
export function init(args: IS3Init): t.IFsS3 {
  const cloud = (() => {
    const { endpoint, accessKey, secret } = args;
    const s3 = fs.s3({ endpoint, accessKey, secret });

    const root = util.trimSlashes(args.root);
    const index = root.indexOf('/');
    const path = {
      bucket: index === -1 ? root : util.trimSlashes(root.substring(0, index)),
      dir: index === -1 ? '/' : `/${util.trimSlashes(root.substring(index))}`,
    };
    if (!path.bucket) {
      throw new Error(`The given 'root' path does not contain a bucket ("${args.root}").`);
    }

    const bucket = s3.bucket(path.bucket);
    return { path, s3, bucket };
  })();

  const getReadParams = (uri: string, bucket: t.S3Bucket) => {
    uri = (uri || '').trim();
    const path = res.resolve(uri).path;
    const key = path.replace(/^\//, '');
    const location = bucket.url(path).object;
    return { uri, key, path, location };
  };

  const res: t.IFsS3 = {
    type: 'S3',

    /**
     * S3 bucket name.
     */
    bucket: cloud.path.bucket,

    /**
     * Root directory of the file system.
     */
    root: cloud.path.dir,

    /**
     * Convert the given string to an absolute path.
     */
    resolve(uri: string, options?: t.IFsResolveArgs) {
      const type = (options ? options.type : 'DEFAULT') as t.IFsResolveArgs['type'];
      const key = path.resolve({ uri, root: res.root });

      if (type === 'SIGNED/get') {
        return {
          path: cloud.s3.url(res.bucket, key).signedGet(options as t.S3SignedUrlGetObjectOptions),
          props: {},
        };
      }

      if (type === 'SIGNED/put') {
        return {
          path: cloud.s3.url(res.bucket, key).signedPut(options as t.S3SignedUrlPutObjectOptions),
          props: {},
        };
      }

      if (type === 'SIGNED/post') {
        const post = cloud.s3.url(res.bucket, key).signedPost(options as t.S3SignedPostOptions);
        return {
          path: post.url,
          props: post.props,
        };
      }

      // DEFAULT.
      return { path: key, props: {} };
    },

    /**
     * Retrieve meta-data of a file on S3.
     */
    async info(uri: string): Promise<t.IFsInfoS3> {
      const { key, path, location } = getReadParams(uri, cloud.bucket);
      try {
        const res = await cloud.bucket.get({ key, metaOnly: true });
        return {
          uri,
          exists: res.ok,
          path,
          location,
          hash: '', // NB: Unknown from raw S3 data (without downloading).
          bytes: res.bytes,
          's3:etag': res.etag,
        };
      } catch (err) {
        return { uri, exists: false, path, location, hash: '', bytes: -1 };
      }
    },

    /**
     * Read from S3
     */
    async read(uri: string): Promise<t.IFsReadS3> {
      const { key, path, location } = getReadParams(uri, cloud.bucket);

      try {
        const res = await cloud.bucket.get({ key });
        const { status, etag = '' } = res;
        const ok = util.isOK(status);
        if (!ok || !res.data) {
          const error: t.IFsError = {
            type: 'FS/read/cloud',
            message: `Failed to read [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path,
          };
          return { ok, status, uri, error, 's3:etag': etag };
        } else {
          const file: t.IFsFileData = {
            path,
            location,
            data: res.data,
            get hash() {
              return Schema.hash.sha256(res.data);
            },
            get bytes() {
              return Uint8Array.from(file.data).length;
            },
          };
          return { ok, status, file, uri, 's3:etag': etag };
        }
      } catch (err) {
        const error: t.IFsError = {
          type: 'FS/read',
          message: `Failed to read [${uri}]. ${err.message}`,
          path,
        };
        return { ok: false, status: 404, uri, error };
      }
    },

    /**
     * Write to the S3.
     */
    async write(
      uri: string,
      data: Buffer,
      options: { filename?: string } = {},
    ): Promise<t.IFsWriteS3> {
      if (!data) {
        throw new Error(`Cannot write, no data provided.`);
      }

      const { filename } = options;
      const contentType = filename ? Schema.mime.toType(filename) : undefined;
      const contentDisposition = filename ? `inline; filename="${filename}"` : undefined;

      uri = (uri || '').trim();
      const path = res.resolve(uri).path;
      const key = path.replace(/^\//, '');
      let hash = '';
      const file: t.IFsFileData = {
        path,
        location: '',
        data,
        get hash() {
          return hash || (hash = Schema.hash.sha256(data));
        },
        get bytes() {
          return Uint8Array.from(file.data).length;
        },
      };

      try {
        // 🌳 NB: All files are stored within a [PRIVATE] security context.
        //        User's gain access to the file download via temporary access
        //        which is provided via "pre-signed" S3 url generated on
        //        each request.
        const acl: t.S3Permissions = 'private';
        const res = await cloud.bucket.put({
          contentType,
          contentDisposition,
          data: file.data,
          key,
          acl,
        });

        const { status, etag = '' } = res;
        const ok = util.isOK(status);
        const location = res.url || '';
        file.location = location;

        if (!ok) {
          const error: t.IFsError = {
            type: 'FS/write/cloud',
            message: `Failed to write [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path,
          };
          return { ok, status, file, uri, error, 's3:etag': etag };
        } else {
          return { ok, status, file, uri, 's3:etag': etag };
        }
      } catch (err) {
        const error: t.IFsError = {
          type: 'FS/write',
          message: `Failed to write [${uri}]. ${err.message}`,
          path,
        };
        return { ok: false, status: 500, uri, file, error };
      }
    },

    /**
     * Delete from S3.
     */
    async delete(uri: string | string[]): Promise<t.IFsDeleteS3> {
      const uris = (Array.isArray(uri) ? uri : [uri]).map(uri => (uri || '').trim());
      const paths = uris.map(uri => res.resolve(uri).path);
      const keys = paths.map(path => path.replace(/^\//, ''));
      const locations = paths.map(path => cloud.bucket.url(path).object);

      try {
        const res = await cloud.bucket.deleteMany({ keys });
        const { status } = res;
        const ok = util.isOK(status);
        if (!res.ok || res.error) {
          const error: t.IFsError = {
            type: 'FS/delete/cloud',
            message: `Failed to delete [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path: paths.join(','),
          };
          return { ok, status, uris, locations, error };
        } else {
          return { ok, status, uris, locations };
        }
      } catch (err) {
        const error: t.IFsError = {
          type: 'FS/delete',
          message: `Failed to delete [${uri}]. ${err.message}`,
          path: paths.join(','),
        };
        return { ok: false, status: 500, uris, locations, error };
      }
    },
  };

  return res;
}
