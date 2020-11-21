import * as t from '../types';
import { IFs } from '@platform/fs.types';
import { toCachePath, cleanDir } from './path';

/**
 * A cache for storing files locally.
 */
export const FileCache = {
  create(args: { fs: IFs; dir: string }) {
    const { fs } = args;
    const dir = cleanDir(args.dir);

    const cache: t.IFileCache = {
      dir,

      async exists(path) {
        return fs.exists(toCachePath(dir, path));
      },

      async get(path) {
        path = toCachePath(dir, path);
        return (await fs.exists(path)) ? await fs.readFile(path) : undefined;
      },

      async put(path, data) {
        path = toCachePath(dir, path);
        await fs.ensureDir(fs.dirname(path));
        await fs.writeFile(path, data);
      },
    };

    return cache;
  },
};
