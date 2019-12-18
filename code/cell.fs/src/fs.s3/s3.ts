import { t, fs, path, sha256, util } from '../common';
export * from '../types';

export type IS3Init = t.S3Config & { root: string };

/**
 * Initializes an "S3" compatible file-system API.
 * eg:
 *  - AWS "S3"
 *  - DigitalOcean "Spaces"
 */
export function init(args: IS3Init): t.IFileSystemS3 {
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

  const res: t.IFileSystemS3 = {
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
    resolve(uri: string) {
      return path.resolve({ uri, root: res.root });
    },

    /**
     * Read from S3
     */
    async read(uri: string): Promise<t.IFileSystemRead> {
      uri = (uri || '').trim();
      const path = res.resolve(uri);
      const key = path.replace(/^\//, '');
      const location = cloud.bucket.url(path);

      try {
        const res = await cloud.bucket.get({ key });
        const { status } = res;
        const ok = util.isOK(status);
        if (!ok || !res.data) {
          const error: t.IFileSystemError = {
            type: 'FS/read/cloud',
            message: `Failed to read [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path,
          };
          return { ok, status, location, error };
        } else {
          const file: t.IFileSystemFile = {
            uri,
            path: location,
            data: res.data,
            get hash() {
              return sha256(res.data);
            },
          };
          return { ok, status, location, file };
        }
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/read',
          message: `Failed to read [${uri}]. ${err.message}`,
          path,
        };
        return { ok: false, status: 404, location, error };
      }
    },

    /**
     * Write to the S3.
     */
    async write(
      uri: string,
      data: Buffer,
      options: { filename?: string } = {},
    ): Promise<t.IFileSystemWrite> {
      if (!data) {
        throw new Error(`Cannot write, no data provided.`);
      }

      const { filename } = options;
      const contentType = filename ? cloud.s3.toContentType(filename) : undefined;
      const contentDisposition = filename ? `inline; filename="${filename}"` : undefined;

      uri = (uri || '').trim();
      const path = res.resolve(uri);
      const key = path.replace(/^\//, '');
      const file: t.IFileSystemFile = {
        uri,
        path,
        data,
        get hash() {
          return sha256(data);
        },
      };

      try {
        const res = await cloud.bucket.put({
          contentType,
          contentDisposition,
          source: file.data,
          key,
          acl: 'public-read', // TODO - S3 Access Control 🐷
        });

        const { status } = res;
        const ok = util.isOK(status);
        const location = res.url || '';
        file.path = res.url ? res.url : file.path;

        if (!ok) {
          const error: t.IFileSystemError = {
            type: 'FS/write/cloud',
            message: `Failed to write [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path,
          };
          return { ok, status, location, file, error };
        } else {
          return { ok, status, location, file };
        }
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/write',
          message: `Failed to write [${uri}]. ${err.message}`,
          path,
        };
        return { ok: false, status: 500, location: '', file, error };
      }
    },

    /**
     * Delete from S3.
     */
    async delete(uri: string | string[]): Promise<t.IFileSystemDelete> {
      const uris = (Array.isArray(uri) ? uri : [uri]).map(uri => (uri || '').trim());
      const paths = uris.map(uri => res.resolve(uri));
      const keys = paths.map(path => path.replace(/^\//, ''));
      const locations = paths.map(path => cloud.bucket.url(path));

      try {
        const res = await cloud.bucket.deleteMany({ keys });
        const { status } = res;
        const ok = util.isOK(status);
        if (!res.ok || res.error) {
          const error: t.IFileSystemError = {
            type: 'FS/delete/cloud',
            message: `Failed to delete [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path: paths.join(','),
          };
          return { ok, status, locations, error };
        } else {
          return { ok, status, locations };
        }
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/delete',
          message: `Failed to delete [${uri}]. ${err.message}`,
          path: paths.join(','),
        };
        return { ok: false, status: 500, locations, error };
      }
    },
  };

  return res;
}
