import { fs } from './libs';

/**
 * Helpers for working with paths
 */
export const Path = {
  base: fs.resolve('.'),

  trimBase(value: string) {
    value = (value || '').trim();
    value = value.startsWith(Path.base) ? value.substring(Path.base.length + 1) : value;
    return cleanDir(value);
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
