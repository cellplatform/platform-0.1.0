import { KeyEncoding } from './Encoding.Key';

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
   * Escape an object-field key (eg. used in {links}).
   */
  escapeKey: KeyEncoding.escape,

  /**
   * Remove escaping of object-field key.
   */
  unescapeKey: KeyEncoding.unescape,

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
