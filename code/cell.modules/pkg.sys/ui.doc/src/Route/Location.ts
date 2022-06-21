import { t } from './common';
import { SearchParams } from './Location.SearchParams';

/**
 * Mock for replacing the default [window.location] object.
 */
export function Location(href: string) {
  const url = new URL(href);

  const location: t.RouteLocation = {
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

    get href() {
      return url.href;
    },
    set href(value: string) {
      url.href = value;
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
    searchParams: SearchParams(url),

    toString() {
      return url.toString();
    },
  };

  return location;
}
