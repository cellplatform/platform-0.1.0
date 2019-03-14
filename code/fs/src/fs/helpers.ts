import * as fsExtra from 'fs-extra';
import { glob } from '../glob';
import { resolve, join } from 'path';

/**
 * Calculates the size of all files within a directory.
 */
export async function folderSize(dir: string) {
  const pattern = resolve(join(dir), '**');
  const wait = (await glob.find(pattern)).map(async path => {
    const stats = await fsExtra.lstat(path);
    return { path, bytes: stats.size };
  });
  const files = await Promise.all(wait);
  const bytes = files.reduce((acc, next) => acc + next.bytes, 0);
  return { bytes, files };
}
