import * as glob from 'glob';

export type IGlobOptions = {
  includeDirs?: boolean;
  dot?: boolean;
  cache?: {};
  statCache?: {};
  realpathCache?: {};
};

/**
 * Matches the given glob pattern as a promise.
 * See:
 *    https://www.npmjs.com/package/glob
 */
export function find(pattern: string, options: IGlobOptions = {}): Promise<string[]> {
  return new Promise<string[]>(async (resolve, reject) => {
    const { dot = false, cache, statCache, realpathCache } = options;
    const includeDirs =
      typeof options.includeDirs === 'boolean'
        ? options.includeDirs
        : pattern.endsWith('/')
        ? true
        : Boolean(options.includeDirs);
    const nodir = !includeDirs;
    const args = { dot, nodir, cache, statCache, realpathCache };
    glob(pattern, args, (err, paths) => {
      if (err) {
        reject(err);
      } else {
        resolve(paths);
      }
    });
  });
}
