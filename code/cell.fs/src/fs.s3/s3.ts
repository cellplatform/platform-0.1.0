import { t, fs, path, sha256 } from '../common';
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

    const root = trimSlashes(args.root);
    const index = root.indexOf('/');
    const path = {
      bucket: index === -1 ? root : trimSlashes(root.substring(0, index)),
      dir: index === -1 ? '/' : `/${trimSlashes(root.substring(index))}`,
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
     * Read from the local file=system.
     */
    async read(uri: string): Promise<t.IFileSystemRead> {
      uri = (uri || '').trim();
      const path = res.resolve(uri);
      const key = path.replace(/^\//, '');
      const location = cloud.bucket.url(path);

      try {
        const res = await cloud.bucket.get({ key });
        const { status } = res;
        if (!res.ok || !res.data) {
          const error: t.IFileSystemError = {
            type: 'FS/read/cloud',
            message: `Failed to read "${uri}". ${res.error ? res.error.message : ''}`.trim(),
            path,
          };
          return { status, location, error };
        } else {
          const file: t.IFileSystemFile = {
            uri,
            path: location,
            data: res.data,
            get hash() {
              return sha256(res.data);
            },
          };
          return { status, location, file };
        }
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/read',
          message: `Failed to read "${uri}". ${err.message}`,
          path,
        };
        return { status: 404, location, error };
      }
    },

    /**
     * Write to the local file-system.
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
        const location = res.url || '';
        file.path = res.url ? res.url : file.path;

        if (!res.ok) {
          const error: t.IFileSystemError = {
            type: 'FS/write/cloud',
            message: `Failed to write "${uri}". ${res.error ? res.error.message : ''}`.trim(),
            path,
          };
          return { status, location, file, error };
        } else {
          return { status, location, file };
        }
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/write',
          message: `Failed to write "${uri}". ${err.message}`,
          path,
        };
        return { status: 404, location: '', file, error };
      }
    },
  };

  return res;
}

/**
 * [Helpers]
 */
const trimSlashes = (input: string) =>
  (input || '')
    .trim()
    .replace(/^\/*/, '')
    .replace(/\/*$/, '')
    .trim();
