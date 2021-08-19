import { Path } from './libs';

/**
 * A string URI that represents the path to a file.
 * Example:
 *
 *    "path:foo/bar.png"
 *
 */
export const PathUri = {
  prefix: 'path',

  is(input?: string) {
    const uri = typeof input === 'string' ? (input ?? '').trim() : '';
    return uri.startsWith('path:');
  },

  path(input?: string) {
    if (!PathUri.is(input)) return undefined;
    const uri = typeof input === 'string' ? (input ?? '').trim() : '';
    let res = uri
      .substring(PathUri.prefix.length + 1)
      .replace(/^\.{3,}/, '') // Clean up 3 or more "..." (eg: "..../foo").
      .replace(/^\/*/, '');

    if (res.startsWith('./')) res = res.substring(2);

    return Path.join(res); // NB: The "join" call passes the path through a "../.." resolver.
  },
};
