import { fs, t } from '../../common';

export type Dir = t.TscDir & { join(): string };
export const toDir = (path: string) => formatDirs(fs.dirname(path), fs.basename(path));
export const toResponseDir = ({ base, dirname }: Dir) => ({ base, dirname });
export const toRelativePath = (dir: Dir, path: string) => path.substring(dir.join().length + 1);

/**
 * Helper for working with clean directory paths.
 */
export function formatDirs(base: string, dirname: string): Dir {
  base = fs.resolve((base || '').trim()).replace(/\/*$/, '');
  dirname = (dirname || '').trim().replace(/\/*$/, '');
  dirname = dirname.startsWith(base) ? (dirname = dirname.substring(base.length + 1)) : dirname;
  dirname = dirname.replace(/^\/*/, '');
  return { base, dirname: dirname, join: () => fs.join(base, dirname) };
}
