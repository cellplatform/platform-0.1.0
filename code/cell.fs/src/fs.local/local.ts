import { fs, path, t } from '../common';

export * from '../types';

/**
 * Initializes a "local" file-system API.
 */
export function init(args: { root: string }): t.IFileSystem {
  const root = fs.resolve(args.root);
  const res: t.IFileSystem = {
    /**
     * Root directory of the file system.
     */
    root,

    /**
     * Convert the given string to an absolute path.
     */
    resolve(uri: string) {
      return path.resolve({ uri, root });
    },

    /**
     * Read from the local file=system.
     */
    async read(uri: string): Promise<t.IFileSystemRead> {
      uri = (uri || '').trim();
      const path = res.resolve(uri);

      // Ensure the file exists.
      if (!(await fs.pathExists(path))) {
        const error: t.IFileSystemError = {
          type: 'FS/read/404',
          message: `A file with the URI "${uri}" does not exist.`,
          path,
        };
        return { status: 404, error };
      }

      // Load the file.
      try {
        const data = await fs.readFile(path);
        const file: t.IFileSystemFile = { uri, path, data };
        return { status: 200, file };
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/read',
          message: `Failed to write file at URI "${uri}". ${err.message}`,
          path,
        };
        return { status: 500, error };
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
      const path = res.resolve(uri);
      const file: t.IFileSystemFile = { uri, path, data };

      try {
        await fs.ensureDir(fs.dirname(path));
        await fs.writeFile(path, data);
        return { status: 200, file };
      } catch (err) {
        const error: t.IFileSystemError = {
          type: 'FS/write',
          message: `Failed to write "${uri}". ${err.message}`,
          path,
        };
        return { status: 500, file, error };
      }
    },
  };

  return res;
}
