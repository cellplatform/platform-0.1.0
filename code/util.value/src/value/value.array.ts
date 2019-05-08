import { R } from '../common';

/**
 * Returns a copy of the array with falsey values removed.
 * Removes:
 *   - null
 *   - undefined
 *   - empty-string ('')
 */
export function compact<T>(list: T[]) {
  return R.pipe(
    R.reject(R.isNil),
    R.reject(R.isEmpty),
  )(list) as T[];
}

/**
 * Converts a nested set of arrays into a flat single-level array.
 */
export function flatten<T>(list: any): T[] {
  if (!Array.isArray(list)) {
    return list;
  }
  const result: any = list.reduce((a, b) => {
    const value: any = Array.isArray(b) ? flatten(b) : b;
    return a.concat(value);
  }, []);
  return result as T[];
}
