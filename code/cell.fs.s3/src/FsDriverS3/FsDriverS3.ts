import { t, fs, Path, isOK, Hash, Mime } from '../common';

export * from '../types';

/**
 * Initializes an "S3" compatible file-system API.
 * eg:
 *  - AWS "S3"
 *  - DigitalOcean "Spaces"
 *  - Wasabi
 *  - (etc)
 */
export function FsDriverS3(args: t.S3Config & { dir: string }): t.FsDriverS3 {
  const cloud = (() => {
    const { endpoint, accessKey, secret } = args;
    const s3 = fs.s3({ endpoint, accessKey, secret });
    const dir = Path.trimSlashes(args.dir);
    const index = dir.indexOf('/');
    const path = {
      bucket: index === -1 ? dir : Path.trimSlashes(dir.substring(0, index)),
      dir: index === -1 ? '/' : `/${Path.trimSlashes(dir.substring(index))}`,
    };
    if (!path.bucket) {
      throw new Error(`The given 'root' path does not contain a bucket ("${args.dir}").`);
    }

    const bucket = s3.bucket(path.bucket);
    return { path, s3, bucket };
  })();

  const trimHost = (input: string) => new URL(input).pathname;

  const getReadParams = (uri: string) => {
    uri = (uri || '').trim();
    const resolved = api.resolve(uri);
    const location = resolved.path;
    const path = trimHost(resolved.path);
    const key = path.replace(/^\//, '');
    return { uri, key, path, location };
  };

  const api: t.FsDriverS3 = {
    type: 'S3',
    endpoint: cloud.s3.endpoint,

    /**
     * S3 bucket name.
     */
    bucket: cloud.path.bucket,

    /**
     * Root directory of the file system.
     */
    dir: cloud.path.dir,

    /**
     * Convert the given string to a URL endpoint.
     */
    resolve(uri: string, options?: t.IFsResolveOptionsS3) {
      const type = (options ? options.type : 'DEFAULT') as t.IFsResolveOptionsS3['type'];
      const endpoint =
        options?.type === 'DEFAULT' || options?.type === 'SIGNED/get'
          ? options.endpoint
          : undefined;
      const key = Path.resolve.fileUri({ uri, dir: api.dir });

      if (type === 'SIGNED/get') {
        const url = cloud.s3
          .url(api.bucket, key, { endpoint })
          .signedGet(options as t.S3SignedUrlGetObjectOptions);
        return {
          path: url,
          props: {},
        };
      }

      if (type === 'SIGNED/put') {
        const url = cloud.s3
          .url(api.bucket, key)
          .signedPut(options as t.S3SignedUrlPutObjectOptions);
        return {
          path: url,
          props: {},
        };
      }

      if (type === 'SIGNED/post') {
        const post = cloud.s3.url(api.bucket, key).signedPost(options as t.S3SignedPostOptions);
        return {
          path: post.url,
          props: post.props,
        };
      }

      // DEFAULT (direct object on S3).
      // NB: This will only work if the object's permission are [public-read].
      return {
        path: cloud.s3.url(api.bucket, key, { endpoint }).object,
        props: {},
      };
    },

    /**
     * Retrieve meta-data of a file on S3.
     */
    async info(uri: string): Promise<t.IFsInfoS3> {
      const { key, path, location } = getReadParams(uri);
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
          's3:permission': res.permission,
        };
      } catch (err) {
        return { uri, exists: false, path, location, hash: '', bytes: -1 };
      }
    },

    /**
     * Read from S3.
     */
    async read(uri: string): Promise<t.IFsReadS3> {
      const { key, path, location } = getReadParams(uri);

      try {
        const res = await cloud.bucket.get({ key });
        const { status, etag = '', permission } = res;
        const ok = isOK(status);

        const done = (args: { error?: t.IFsError; file?: t.IFsFileData }): t.IFsReadS3 => {
          const { error, file } = args;
          const ok = isOK(status);
          return { ok, status, uri, file, error, 's3:etag': etag, 's3:permission': permission };
        };

        if (!ok || !res.data) {
          const error: t.IFsError = {
            type: 'FS/read',
            message: `Failed to read [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path,
          };
          return done({ error });
        } else {
          const data = new Uint8Array(res.data);
          let hash = '';
          const file: t.IFsFileData = {
            path,
            location,
            data,
            bytes: data.byteLength,
            get hash() {
              return hash || (hash = Hash.sha256(data));
            },
          };
          return done({ file });
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
      data: Uint8Array,
      options: { filename?: string; permission?: t.FsS3Permission } = {},
    ): Promise<t.IFsWriteS3> {
      if (!data) {
        throw new Error(`Cannot write, no data provided.`);
      }

      /**
       * 🌳 NB: All files are stored within a [PRIVATE] security context BY DEFAULT.
       *        User's gain access to the file download via temporary access
       *        which is provided via "pre-signed" S3 url generated on
       *        each request.
       */

      const { filename, permission = 'private' } = options;
      const contentType = filename ? Mime.toType(filename) : undefined;
      const contentDisposition = filename ? `inline; filename="${filename}"` : undefined;

      uri = (uri || '').trim();
      const path = trimHost(api.resolve(uri).path);
      const key = path.replace(/^\//, '');
      let hash = '';
      const file: t.IFsFileData = {
        path,
        location: '',
        data,
        bytes: data.byteLength,
        get hash() {
          return hash || (hash = Hash.sha256(data));
        },
      };

      try {
        const res = await cloud.bucket.put({
          contentType,
          contentDisposition,
          data: Buffer.from(file.data), // HACK: This ensures the underlying AWS library doesn't fail.
          key,
          acl: permission,
        });

        const { status, etag = '' } = res;
        const ok = isOK(status);
        const location = res.url || '';
        file.location = location;

        if (!ok) {
          const error: t.IFsError = {
            type: 'FS/write',
            message: `Failed to write [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path,
          };
          return { ok, status, file, uri, error, 's3:etag': etag, 's3:permission': permission };
        } else {
          return { ok, status, file, uri, 's3:etag': etag, 's3:permission': permission };
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
      const uris = (Array.isArray(uri) ? uri : [uri]).map((uri) => (uri || '').trim());
      const locations = uris.map((uri) => api.resolve(uri).path);
      const keys = locations.map((path) => trimHost(path).replace(/^\//, ''));

      try {
        const res = await cloud.bucket.deleteMany({ keys });
        const { status } = res;
        const ok = isOK(status);
        if (!res.ok || res.error) {
          const error: t.IFsError = {
            type: 'FS/delete',
            message: `Failed to delete [${uri}]. ${res.error ? res.error.message : ''}`.trim(),
            path: locations.join(','),
          };
          return { ok, status, uris, locations, error };
        } else {
          return { ok, status, uris, locations };
        }
      } catch (err) {
        const error: t.IFsError = {
          type: 'FS/delete',
          message: `Failed to delete [${uri}]. ${err.message}`,
          path: locations.join(','),
        };
        return { ok: false, status: 500, uris, locations, error };
      }
    },

    /**
     * Copy an object on S3.
     */
    async copy(
      sourceUri: string,
      targetUri: string,
      options: t.IFsCopyOptionsS3 = {},
    ): Promise<t.IFsCopyS3> {
      const format = (input: string) => {
        const uri = (input || '').trim();
        const path = api.resolve(uri).path;
        const key = trimHost(path).replace(/^\//, '');
        const object = { bucket: api.bucket, key };
        return { uri, path, key, object };
      };

      const { permission } = options;
      const source = format(sourceUri);
      const target = format(targetUri);
      const ERROR = `Failed to copy from [${source.uri}] to [${target.uri}].`;

      const toError = (message: string): t.IFsError => ({
        type: 'FS/copy',
        message,
        path: target.path,
      });

      const done = (status: number, error?: string) => {
        status = status.toString().startsWith('2') && error ? 500 : status;
        return {
          ok: isOK(status),
          status,
          source: source.uri,
          target: target.uri,
          error: error ? toError(error) : undefined,
        };
      };

      const sourceInfo = await api.info(source.uri);
      if (!sourceInfo.exists) {
        const error = `Failed to copy [${source.uri}] as it does not exist.`;
        return done(404, error);
      }

      try {
        const res = await cloud.s3.copy({
          source: source.object,
          target: target.object,
          acl: permission,
        });
        const error = res.error ? `${ERROR} ${res.error.message}` : undefined;
        return done(res.status, error);
      } catch (err) {
        const error = `${ERROR} ${err.message}`;
        return done(500, error);
      }
    },
  };

  return api;
}
