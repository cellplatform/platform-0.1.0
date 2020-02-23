import { t, value } from '../common';

/**
 * Parse URL parameters.
 */
export function params<T extends object>(args: { route: t.IRoute; path: string }): T {
  const { route } = args;
  const { regex, keys } = route;

  const path = normalizePathname((args.path || '').split('?')[0]);
  const parts = regex.exec(path) || [];

  const res = keys.reduce((acc, key, i) => {
    acc[key.name] = value.toType(parts[i + 1]);
    return acc;
  }, {});

  return value.deleteUndefined(res) as T;
}

/**
 * [Helpers]
 */

/**
 * Normalize a pathname for matching, replaces multiple slashes with a single
 * slash and normalizes unicode characters to "NFC". When using this method,
 * `decode` should be an identity function so you don't decode strings twice.
 *
 * See:
 *    https://github.com/pillarjs/path-to-regexp#normalize-pathname
 *
 */
const normalizePathname = (pathname: string) => {
  return (
    decodeURI(pathname)
      // Replaces repeated slashes in the URL.
      .replace(/\/+/g, '/')
      // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
      // Note: Missing native IE support, may want to skip this step.
      .normalize()
  );
};
