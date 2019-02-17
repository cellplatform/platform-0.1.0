import { toBool } from '../common';

/**
 * Represents a query-string.
 * NB: this record type is derived from NextJS's declaration
 * for the [ctx.query] type.
 */
export type UrlQuery = Record<string, string | string[] | number | boolean | undefined>;

/**
 * Takes a query-string value and parses it into an object.
 */
export function toObject<T>(queryString?: string): T {
  // Setup initial conditions.
  const EMPTY = {};
  if (!queryString) {
    return EMPTY as T;
  }
  if (!queryString.trim()) {
    return EMPTY as T;
  }

  // Remove "#" and "?" prefix.
  let text = queryString.trim();
  text = !text.startsWith('?') ? text : text.substring(1);
  text = !text.startsWith('#') ? text : text.substring(1);

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
    const value = pair[1] ? decodeURIComponent(pair[1]) : undefined;
    obj[key] = value;
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
export function isFlag(keys: string | string[] | undefined, query?: UrlQuery) {
  keys = keys ? (Array.isArray(keys) ? keys : [keys]) : [];
  return query ? keys.some(key => valueAsFlag(query[key])) : false;
}
