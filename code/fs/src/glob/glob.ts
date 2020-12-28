import * as glob from 'glob';
import { remove } from 'fs-extra';

export type GlobFindOptions = {
  includeDirs?: boolean;
  dot?: boolean;
  cache?: { [path: string]: boolean | 'DIR' | 'FILE' | ReadonlyArray<string> };
  statCache?: { [path: string]: false | { isDirectory(): boolean } | undefined };
  realpathCache?: { [path: string]: string };
  ignore?: string | string[];
};

export const Glob = {
  /**
   * Matches the given glob pattern as a promise.
   * See:
   *    https://www.npmjs.com/package/glob
   */
  find(pattern: string, options: GlobFindOptions = {}): Promise<string[]> {
    return new Promise<string[]>(async (resolve, reject) => {
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
        if (err) {
          reject(err);
        } else {
          resolve(paths);
        }
      });
    });
  },

  /**
   * Deletes matching files.
   */
  async remove(pattern: string, options: GlobFindOptions = {}) {
    const paths = await Glob.find(pattern, options);
    await Promise.all(paths.map((path) => remove(path)));
    return paths;
  },
};
