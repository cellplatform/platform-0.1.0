import { fs, path, t, sha256, Urls, toMimetype } from '../common';

export * from '../types';
const toLocation = (path: string) => `file://${path}`;

/**
 * Initializes a "local" file-system API.
 */
export function init(args: { root: string }): t.IFileSystemLocal {
  const root = fs.resolve(args.root);
  const res: t.IFileSystemLocal = {
    type: 'LOCAL',

    /**
     * Root directory of the file system.
     */
    root,

    /**
     * Convert the given string to an absolute path.
     */
    resolve(uri: string, options?: t.IFileSystemResolveArgs): t.IFileSystemLocation {
      const type = options ? options.type : 'DEFAULT';

      if (type === 'SIGNED/post') {
        // NB: A local simulated end-point of an AWS/S3 "presignedPost" URL.
        const args = options as t.S3SignedPostOptions;
        const key = path.resolve({ uri, root });
        return {
          path: Urls.routes.LOCAL.FS,
          props: {
            'content-type': args.contentType || toMimetype(key, 'application/octet-stream'),
            key,
          },
        };
      }

      if (type !== 'DEFAULT') {
        throw new Error(`Local file-system resolve only supports DEFAULT operation.`);
      }
      return {
        path: path.resolve({ uri, root }),
        props: {},
      };
    },

    /**
     * Read from the local file-system.
     */
    async read(uri: string): Promise<t.IFileSystemRead> {
      uri = (uri || '').trim();
      const path = res.resolve(uri).path;
      const location = toLocation(path);

      // Ensure the file exists.
      if (!(await fs.pathExists(path))) {
        const error: t.IFileSystemError = {
          type: 'FS/read/404',
          message: `A file with the URI [${uri}] does not exist.`,
          path,
        };
        return { ok: false, status: 404, location, error };
      }

      // Load the file.
      try {
        const data = await fs.readFile(path);
        const file: t.IFileSystemFile = {
          uri,
          path,
          data,
          get hash() {
            return sha256(data);
          },
          get bytes() {
            return Uint8Array.from(file.data).length;
          },
        };
        return { ok: true, status: 200, location, file };
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/read',
          message: `Failed to write file at URI [${uri}]. ${err.message}`,
          path,
        };
        return { ok: false, status: 500, location, error };
      }
    },

    /**
     * Write to the local file-system.
     */
    async write(uri: string, data: Buffer): Promise<t.IFileSystemWrite> {
      if (!data) {
        throw new Error(`Cannot write, no data provided.`);
      }

      uri = (uri || '').trim();
      const path = res.resolve(uri).path;
      const location = toLocation(path);
      const file: t.IFileSystemFile = {
        uri,
        path,
        data,
        get hash() {
          return sha256(data);
        },
        get bytes() {
          return Uint8Array.from(file.data).length;
        },
      };

      try {
        await fs.ensureDir(fs.dirname(path));
        await fs.writeFile(path, data);
        return { ok: true, status: 200, location, file };
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/write',
          message: `Failed to write [${uri}]. ${err.message}`,
          path,
        };
        return { ok: false, status: 500, location, file, error };
      }
    },

    /**
     * Delete from the local file-system.
     */
    async delete(uri: string | string[]): Promise<t.IFileSystemDelete> {
      const uris = (Array.isArray(uri) ? uri : [uri]).map(uri => (uri || '').trim());
      const paths = uris.map(uri => res.resolve(uri).path);
      const locations = paths.map(path => toLocation(path));

      try {
        await Promise.all(paths.map(path => fs.remove(path)));
        return { ok: true, status: 200, locations };
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
