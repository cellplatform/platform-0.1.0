import { fs, semver } from '../common';

/**
 * Retrieves the last directory from within the given path.
 */
export async function latestDir(parentDir: string) {
  const dirs = await sortedSemverChildren(parentDir);
  return dirs[dirs.length - 1];
}

export async function sortedSemverChildren(parentDir: string) {
  parentDir = fs.resolve(parentDir);
  const paths = await fs.glob.find(fs.join(parentDir, '*/'), { includeDirs: true });
  const names = paths.map(path => fs.basename(path)).filter(name => semver.valid(name));
  return semver.sort(names).map(name => fs.join(parentDir, name));
}
