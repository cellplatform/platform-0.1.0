import { fs } from './libs';

/**
 * Helpers for working with paths
 */
export const path = {
  base: fs.resolve('.'),

  trimBase(value: string) {
    value = (value || '').trim();
    return cleanDir(value.startsWith(path.base) ? value.substring(path.base.length + 1) : value);
  },

  dir(input?: string) {
    const dir = cleanDir(input);
    return {
      path: dir,
      toString: () => dir,
      append: (path?: string) => (dir ? `${dir}/${cleanDir(path)}` : path) as string,
      prepend: (path?: string) => (dir ? `${cleanDir(path)}/${dir}` : path) as string,
    };
  },
};

/**
 * [Helpers]
 */

const cleanDir = (input?: string) => (input || '').trim().replace(/\/*$/, '');
