import { t } from './common';

/**
 * Mock for replacing the default [window.location] object.
 */
export function LocationMock(href = 'https://domain.com/mock') {
  const url = new URL(href);

  const location: t.RouteLocation = {
    get href() {
      return url.href;
    },
    get origin() {
      return url.origin;
    },
    get host() {
      return url.host;
    },
    get hostname() {
      return url.hostname;
    },
    get port() {
      return url.port;
    },
    get protocol() {
      return url.protocol;
    },

    get pathname() {
      return url.pathname;
    },
    set pathname(value: string) {
      url.pathname = value;
    },

    get hash() {
      return url.hash;
    },
    set hash(value: string) {
      url.hash = value;
    },

    get search() {
      return url.search;
    },
    searchParams: {
      get keys() {
        return Array.from(new Set(url.searchParams.keys()));
      },
      get: (key: string) => url.searchParams.get(key),
      set: (key: string, value: string) => url.searchParams.set(key, value),
      delete: (key: string) => url.searchParams.delete(key),
    },

    toString() {
      return url.toString();
    },
  };

  return location;
}
