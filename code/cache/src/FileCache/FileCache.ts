import * as t from '../types';
import { IFs } from '@platform/fs.types';

/**
 * A cache for storing files locally.
 */
export const FileCache = {
  create(args: { fs: IFs; dir: string }) {
    const { fs } = args;
    const dir = cleanPath(args.dir);
    const toCachePath = (path: string) => fs.join(dir, cleanPath(path).replace(/^\/*/, ''));

    const cache: t.IFileCache = {
      dir,

      async exists(path) {
        return fs.exists(toCachePath(path));
      },

      async get(path) {
        path = toCachePath(path);
        return (await fs.exists(path)) ? await fs.readFile(path) : undefined;
      },

      async put(path, data) {
        path = toCachePath(path);
        await fs.ensureDir(fs.dirname(path));
        await fs.writeFile(path, data);
      },
    };

    return cache;
  },
};

/**
 * Helpers
 */

const cleanPath = (path: string) => (path || '').trim();
