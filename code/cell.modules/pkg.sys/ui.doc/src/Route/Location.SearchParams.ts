import { t } from './common';

export function SearchParams(url: URL): t.RouteLocationSearchParams {
  const api = {
    get keys() {
      return Array.from(new Set(url.searchParams.keys()));
    },
    get: (key: string) => url.searchParams.get(key),
    set: (key: string, value: string) => url.searchParams.set(key, value),
    delete: (key: string) => url.searchParams.delete(key),
    toObject() {
      return api.keys.reduce((acc, next) => {
        acc[next] = api.get(next);
        return acc;
      }, {});
    },
  };
  return api;
}
