import { fs, constants, FileCache } from '../common';

/**
 * Local file-system cache.
 */
export function fileHashCache(args: { hash: string }) {
  const dir = constants.PATH.CACHE_DIR;
  return FileCache.create({ dir, fs }).file(args.hash);
}
