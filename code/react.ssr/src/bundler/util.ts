import { fs } from '../common';

/**
 * Retrieves the last directory from within the given path.
 */
export async function lastDir(parentDir: string) {
  parentDir = fs.resolve(parentDir);
  const dirs = await fs.glob.find(fs.join(parentDir, '*'), { type: 'DIRS' });
  return dirs.sort()[dirs.length - 1];
}
