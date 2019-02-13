/**
 * Determines whether the given value is a Promise.
 */
export function isPromise(value?: any) {
  return value
    ? typeof value === 'object' && typeof value.then === 'function'
    : false;
}
