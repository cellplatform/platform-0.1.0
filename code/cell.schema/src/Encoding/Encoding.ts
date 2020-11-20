/**
 * Utilities for escaping/unescaping strings.
 */
export const Encoding = {
  /**
   * Escape reserved characters from a path.
   */
  escapePath: (value: string) => value.replace(/\//g, '\\'),

  /**
   * Remove escaping from a path.
   */
  unescapePath: (value: string) => value.replace(/\\/g, '/'),

  /**
   * Escape a "scope" namespace.
   */
  escapeNamespace: (value: string) => value.replace(/\./g, '__'),

  /**
   * Removing escaping from "scope" namespace.
   */
  unescapeNamespace: (value: string) => value.replace(/__/g, '.'),

  /**
   * Apply encoding function to an object.
   */
  transformKeys(obj: Record<string, any>, fn: (input: string) => string) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[fn(key)] = obj[key];
      return acc;
    }, {});
  },

  transformValues(obj: Record<string, any>, fn: (input: string) => string) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = fn(obj[key]);
      return acc;
    }, {});
  },
};
