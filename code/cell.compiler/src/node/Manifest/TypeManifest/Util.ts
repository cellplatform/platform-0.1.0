import { fs } from '../../common';
import { Dirs } from './types';

export { Info } from './Util.Info';

/**
 * Helper for working with clean directory paths.
 */
export function formatDirs(base: string, dirname: string): Dirs {
  base = fs.resolve((base || '').trim()).replace(/\/*$/, '');
  dirname = (dirname || '').trim().replace(/\/*$/, '');
  dirname = dirname.startsWith(base) ? (dirname = dirname.substring(base.length + 1)) : dirname;
  dirname = dirname.replace(/^\/*/, '');
  return { base, dirname: dirname, join: () => fs.join(base, dirname) };
}
