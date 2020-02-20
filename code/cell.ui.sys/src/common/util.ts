/**
 * Convert an input string to an object.
 */
export function toQueryObject<T>(input?: string) {
  return (input || window.location.search || '')
    .replace(/^\?/, '')
    .split('&')
    .map(item => item.split('='))
    .reduce((acc, next) => {
      const key = next[0];
      const value = decodeURIComponent(next[1]);
      acc[key] = value;
      return acc;
    }, {}) as T;
}
