import { t } from './common';

type DirectoryPath = string;

/**
 * Filesystem helpers for working with Vercel.
 */
export const VercelFs = {
  /**
   * Read directory into a "bundle" (manifest WITH binary file data).
   */
  async readdir(fs: t.Fs, path?: DirectoryPath) {
    if (typeof path === 'string' && !(await fs.is.dir(path))) {
      throw new Error(`Path is not a directory: ${path}`);
    }

    const dir = fs.dir(path ?? '');
    const manifest = await dir.manifest();
    const wait = manifest.files.map(async ({ path }) => ({ path, data: await dir.read(path) }));
    const files: t.VercelFile[] = (await Promise.all(wait)).filter((file) => Boolean(file.data));
    const bundle: t.VercelSourceBundle = { files, manifest };

    return bundle;
  },
};
