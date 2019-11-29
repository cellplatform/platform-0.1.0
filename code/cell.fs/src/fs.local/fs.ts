import { t, fs, Schema } from '../common';
import { ensureDir } from 'fs-extra';
export * from '../types';

/**
 * Initializes a "local" file-system API.
 */
export function init(args: { dir: string }) {
  const dir = fs.resolve(args.dir);

  const res: t.IFileSystem = {
    /**
     * Convert the given string to an absolute path.
     */
    resolve(uri: string) {
      const file = Schema.uri.parse(uri);

      if (!file.ok || file.error) {
        const err = file.error;
        const msg = `Invalid URI. ${err ? err.message : ''}`.trim();
        throw new Error(msg);
      }
      if (file.parts.type !== 'file') {
        const msg = `Invalid URI. Not of type "file:" ("${uri}").`;
        throw new Error(msg);
      }

      return fs.join(dir, `ns.${file.parts.ns}`, file.parts.file);
    },

    /**
     * Read from the local file=system.
     */
    async read(uri: string): Promise<t.IFileReadResponse> {
      const path = res.resolve(uri);

      // Ensure the file exists.
      if (!(await fs.pathExists(path))) {
        const error: t.IFileError = {
          type: 'FS/404',
          message: `A file with the URI "${uri}" does not exist.`,
          path,
        };
        return { error };
      }

      // Load the file.
      const data = await fs.readFile(path);
      const file: t.IFile = { uri, path, data };

      // Finish up.
      return { file };
    },

    /**
     * Write to the local file-system.
     */
    async write(uri: string, data: Buffer): Promise<t.IFileWriteResponse> {
      if (!data) {
        throw new Error(`Cannot write, no data provided.`);
      }

      const path = res.resolve(uri);
      const file: t.IFile = { uri, path, data };

      try {
        await ensureDir(fs.dirname(path));
        await fs.writeFile(path, data);
        return { file };
      } catch (err) {
        const error: t.IFileError = {
          type: 'FS/write',
          message: `Failed to write "${uri}". ${err.message}`,
          path,
        };
        return { file, error };
      }
    },
  };

  return res;
}
