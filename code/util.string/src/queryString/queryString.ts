import { toBool } from '../common';
import * as t from './types';

export * from './types';

/**
 * Takes a query-string value and parses it into an object.
 */
export function toObject<T extends t.UrlQueryObject>(href?: string): T {
  // Setup initial conditions.
  const EMPTY = {};
  if (!href) {
    return EMPTY as T;
  }
  if (!href.trim()) {
    return EMPTY as T;
  }

  // Parse URL if provided.
  href = href.trim();
  href = href.includes('?') ? href.substring(href.indexOf('?')) : href;

  // Remove "#" and "?" prefix.
  let text = href;
  text = !text.startsWith('?') ? text : text.substring(1);
  text = !text.startsWith('#') ? text : text.substring(1);

  const parseType = (input: any) => {
    input = input === '' ? true : input; // NB: existence of key into flag, eg: `/foo?q` => `/foo?q=true`
    input = input === 'true' ? true : input;
    input = input === 'false' ? false : input;
    return input;
  };

  // Convert to object.
  const pairs = text.split('&');
  const obj = {};
  let pair;
  for (const i in pairs) {
    if (pairs[i] === '') {
      continue;
    }
    pair = pairs[i].split('=');
    const key = decodeURIComponent(pair[0]);
    const value = parseType(pair[1] ? decodeURIComponent(pair[1]) : '');
    if (obj[key] === undefined) {
      obj[key] = value;
    } else {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    }
  }

  // Finish up.
  return obj as T;
}

/**
 * Converts a query-string [true/false/undefined] value to a boolean flag.
 * Note:
 *    This is useful for when the presence of query-string key should
 *    indicate that the flag is present and true, eg.
 *
 *      - "/foo?force"        // <== true  (implicit)
 *      - "/foo?force=true"   // <== true  (explicit)
 *      - "/foo?force=false"  // <== false (explicit)
 *      - "/foo"              // <== false, query flag undefined.
 *
 * Example:
 *
 *      const force = valueAsFlag(req.query.force)
 *
 */
export function valueAsFlag<T>(value?: string | string[] | number | boolean): T {
  return value === undefined ? false : value === '' ? true : toBool(value, false);
}

/**
 * Checks a set of keys within a query-string to see if any of them
 * are flags.
 */
export function isFlag(keys: string | string[] | undefined, query?: t.UrlQuery) {
  keys = keys ? (Array.isArray(keys) ? keys : [keys]) : [];
  return query ? keys.some(key => valueAsFlag(query[key])) : false;
}

/**
 * Creates a builder for progressively adding values to a query string.
 */
export function build(options: { allowNil?: boolean } = {}) {
  type V = string | number | boolean | null;
  type Q = { key: string; value?: V; entry: string };

  const allowNil = options.allowNil === undefined ? true : options.allowNil;

  const builder = {
    parts: [] as Q[],

    add(key: string, value?: V) {
      const isNil = value === undefined || value === null;
      if (!allowNil && isNil) {
        return builder;
      }
      const entry = isNil ? key : `${key}=${encodeURIComponent(value || '')}`;
      builder.parts = [...builder.parts, { key, value, entry }];
      return builder;
    },

    toString() {
      return builder.parts.length === 0 ? '' : `?${builder.parts.map(p => p.entry).join('&')}`;
    },
  };

  return builder;
}
