import * as glob from 'glob';
import { remove } from 'fs-extra';

export type GlobFindFilter = (path: string) => boolean;
export type GlobFindOptions = {
  includeDirs?: boolean;
  dot?: boolean;
  cache?: { [path: string]: boolean | 'DIR' | 'FILE' | ReadonlyArray<string> };
  statCache?: { [path: string]: false | { isDirectory(): boolean } | undefined };
  realpathCache?: { [path: string]: string };
  ignore?: string | string[];
  filter?: GlobFindFilter;
};

/**
 * Tools for working with "glob" wildcard patterns.
 * https://en.wikipedia.org/wiki/Glob_(programming)
 */
export const Glob = {
  /**
   * Matches the given glob pattern as a promise.
   * See:
   *    https://www.npmjs.com/package/glob
   */
  find(pattern: string, input?: GlobFindOptions | GlobFindFilter): Promise<string[]> {
    return new Promise<string[]>(async (resolve, reject) => {
      const options: GlobFindOptions = (typeof input === 'object' ? input : {}) as GlobFindOptions;
      const filter = typeof input === 'function' ? input : options.filter;

      const { dot = false, cache, statCache, realpathCache, ignore } = options;
      const includeDirs =
        typeof options.includeDirs === 'boolean'
          ? options.includeDirs
          : pattern.endsWith('/')
          ? true
          : Boolean(options.includeDirs);
      const nodir = !includeDirs;

      const args = { dot, nodir, cache, statCache, realpathCache, ignore };
      glob(pattern, args, (err, paths) => {
        if (err) return reject(err);
        if (typeof filter === 'function') paths = paths.filter(filter);
        resolve(paths);
      });
    });
  },

  /**
   * Delete files matching the given glob pattern.
   */
  async remove(pattern: string, options?: GlobFindOptions | GlobFindFilter) {
    const paths = await Glob.find(pattern, options);
    await Promise.all(paths.map((path) => remove(path)));
    return paths;
  },
};
