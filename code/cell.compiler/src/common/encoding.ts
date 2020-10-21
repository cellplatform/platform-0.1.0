/**
 * Utilities for escaping/unescaping strings.
 */
export const encoding = {
  /**
   * Escape reserved characters from a path.
   */
  escapePath: (key: string) => key.replace(/\//g, '\\'),
  escapeKeyPaths(obj: Record<string, any>) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[encoding.escapePath(key)] = obj[key];
      return acc;
    }, {});
  },

  /**
   * Remove escaping from a path.
   */
  unescapePath: (key: string) => key.replace(/\\/g, '/'),
  unescapeKeyPaths(obj: Record<string, any>) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[encoding.unescapePath(key)] = obj[key];
      return acc;
    }, {});
  },
};
