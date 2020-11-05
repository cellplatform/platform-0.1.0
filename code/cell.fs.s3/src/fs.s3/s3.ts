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

  const trimHost = (input: string) => {
    const host = cloud.bucket.url('').object;
    return input.startsWith(host) ? input.substring(host.length - 1) : input;
  };

  const getReadParams = (uri: string) => {
    uri = (uri || '').trim();
    const resolved = res.resolve(uri);
    const location = resolved.path;
    const path = trimHost(resolved.path);
    const key = path.replace(/^\//, '');
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

      // DEFAULT (direct object on S3).
      return {
        path: cloud.s3.url(res.bucket, key).object,
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
     * Read from S3
     */
    async read(uri: string): Promise<t.IFsReadS3> {
      const { key, path, location } = getReadParams(uri);

      try {
        const res = await cloud.bucket.get({ key });
        const { status, etag = '', permission } = res;
        const ok = util.isOK(status);

        const done = (args: { error?: t.IFsError; file?: t.IFsFileData }): t.IFsReadS3 => {
          const { error, file } = args;
          const ok = util.isOK(status);
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
      data: Buffer,
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
      const contentType = filename ? Schema.mime.toType(filename) : undefined;
      const contentDisposition = filename ? `inline; filename="${filename}"` : undefined;

      uri = (uri || '').trim();
      const path = trimHost(res.resolve(uri).path);
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
        const res = await cloud.bucket.put({
          contentType,
          contentDisposition,
          data: file.data,
          key,
          acl: permission,
        });

        const { status, etag = '' } = res;
        const ok = util.isOK(status);
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
      const locations = uris.map((uri) => res.resolve(uri).path);
      const keys = locations.map((path) => trimHost(path).replace(/^\//, ''));

      try {
        const res = await cloud.bucket.deleteMany({ keys });
        const { status } = res;
        const ok = util.isOK(status);
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
     * Copy an object on S3
     */
    async copy(
      sourceUri: string,
      targetUri: string,
      options: t.IFsCopyOptionsS3 = {},
    ): Promise<t.IFsCopyS3> {
      console.log('sourceUri', sourceUri);
      console.log('targetUri', targetUri);

      const format = (input: string) => {
        const uri = (input || '').trim();
        const path = res.resolve(uri).path;
        const bucket = 'cell'; // TEMP 🐷
        const key = trimHost(path).replace(/^\//, '');
        const object = { bucket, key };
        return { uri, bucket, path, key, object };
      };

      const { permission } = options;
      const source = format(sourceUri);
      const target = format(targetUri);

      const done = (status: number, error?: t.IFsError) => {
        const ok = util.isOK(status);
        return { ok, status, source: source.uri, target: target.uri, error };
      };

      try {
        // fs.en
        // console.log('fs', fs.type);
        // await fs.ensureDir(fs.dirname(target.path));
        // await fs.writeFile(target.path, await fs.readFile(source.path));
        // cloud.bucket.copy({})

        console.log('args', args);

        console.log('source', source);

        console.log('res.bucket', res.bucket);
        console.log('res.root', res.root);

        // const s = { bucket: source.bucket, key: source.key };
        // const t = { bucket: target.bucket, key: target.key };

        const copyResponse = await cloud.s3.copy({
          source: source.object,
          target: target.object,
          acl: permission,
        });
        console.log('-------------------------------------------');
        console.log('res', copyResponse);

        /**
         * TODO 🐷
         *
         * - SAME HOST: key => key
         * -            bucketA:key => bucketB:key
         * - DIFFERENT HOST
         * - LOCAL => CLOUD
         * - CLOUD => LOCAL
         *
         */

        // cloud.bucket.
        // s3.
        // s3.g
        // cloud.s3.
        // TODO 🐷

        return done(200);
      } catch (err) {
        const message = `Failed to copy from [${source.uri}] to [${target.uri}]. ${err.message}`;
        const error: t.IFsError = {
          type: 'FS/copy',
          message,
          path: target.path,
        };
        return done(500, error);
      }
    },
  };

  return res;
}
