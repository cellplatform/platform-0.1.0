import { t } from './common';

/**
 * Helper for working with the mutable URL "searchParams" object.
 */
export function QueryParams(input: URL | string) {
  const url = typeof input === 'string' ? new URL(input) : input;

  const api: t.RouteQueryParams = {
    url,
    get keys() {
      return Array.from(new Set(url.searchParams.keys()));
    },
    get: (key: string) => url.searchParams.get(key),
    set: (key: string, value: string) => {
      if (typeof value === 'string') {
        url.searchParams.set(key, value);
      } else {
        api.delete(key);
      }
    },
    delete: (key: string) => url.searchParams.delete(key),
    clear: () => api.keys.forEach((key) => url.searchParams.delete(key)),
    toString: () => url.search,
    toObject() {
      return api.keys.reduce((acc, next) => {
        acc[next] = api.get(next);
        return acc;
      }, {});
    },
  };

  return api;
}
