import * as t from '../types';
import { cleanPath } from './path';

/**
 * A cache for storing a single file
 */
export const CachedFile = {
  create(args: { cache: t.IFileCache; path: string }) {
    const { cache } = args;
    const path = cleanPath(args.path);

    const file: t.ICachedFile = {
      dir: cache.dir,
      path,

      async exists() {
        return cache.exists(path);
      },

      async get() {
        return cache.get(path);
      },

      async put(data) {
        await cache.put(path, data);
      },

      async delete() {
        await cache.delete(path);
      },
    };

    return file;
  },
};
