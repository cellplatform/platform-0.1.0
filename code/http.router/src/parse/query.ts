import { value, queryString } from '../common';

/**
 * Parse a query string.
 */
export function query<T extends object>(args: { path: string }): T {
  const { path = '' } = args;
  const index = path.indexOf('?');
  const toString = () => (index < 0 ? '' : path.substring(index) || '');

  if (index < 0) {
    const empty = { toString };
    return empty as T;
  }

  const parseType = (input: any) => value.toType(input);
  const query: any = queryString.toObject(toString().replace(/^\?/, ''));
  Object.keys(query).forEach(key => {
    const value = query[key];
    query[key] = Array.isArray(value) ? value.map(item => parseType(item)) : parseType(value);
  });

  const res = {
    ...query, // NB: Ensure a simple object is returned.
    toString,
  };
  return res as T;
}
