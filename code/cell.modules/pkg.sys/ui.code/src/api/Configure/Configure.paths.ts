import { PATH } from '../common';

/**
 * Calculate static paths.
 */
export function staticPaths(root?: string) {
  const trim = (path: string) => (path || '').replace(/^\/*/, '').replace(/\/*$/, '');
  const format = (path: string) => {
    path = trim(path);
    return root ? `${trim(root)}/${path}` : path;
  };

  return {
    vs: format(PATH.STATIC.VS),
    types: {
      es: format(PATH.STATIC.TYPES.ES),
      cell: format(PATH.STATIC.TYPES.SYS),
    },
  };
}
