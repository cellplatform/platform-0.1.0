import { fs, semver } from '../common';

/**
 * Retrieves the last directory from within the given path.
 */

export function dir(parentDir: string) {
  const api = {
    /**
     * Retrieves the latest semver directory.
     */
    async latest() {
      const dirs = await api.semver();
      return dirs[dirs.length - 1];
    },

    /**
     * Retrievs child directories that are semvers.
     */
    async semver(options: { sort?: 'ASC' | 'DESC' } = {}) {
      const { sort = 'ASC' } = options;
      parentDir = fs.resolve(parentDir);
      const paths = await fs.glob.find(fs.join(parentDir, '*/'), { includeDirs: true });
      const names = paths.map(path => fs.basename(path)).filter(name => semver.valid(name));
      const ascending = semver.sort(names).map(name => fs.join(parentDir, name));
      return sort === 'DESC' ? ascending.reverse() : ascending;
    },
  };
  return api;
}
