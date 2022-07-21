import { PATH, t } from '../common';

/**
 * Calculate static paths.
 */
export function staticPaths(root?: string): t.CodeEditorStaticPaths {
  const trim = (path: string) => (path || '').replace(/^\/*/, '').replace(/\/*$/, '');
  const format = (path: string) => {
    path = trim(path);
    return root ? `${trim(root)}/${path}` : path;
  };

  return {
    vs: format(PATH.STATIC.VS),
    types: {
      es: format(PATH.STATIC.TYPES.ES),
      sys: format(PATH.STATIC.TYPES.SYS),
    },
  };
}
