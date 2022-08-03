import * as t from './types';
import { QueryString } from '../QueryString';
import { UrlQueryObject } from '../QueryString/types';

/**
 * Parses a URL into standard parts.
 */
export const Url = (input: string | { url: string }): t.Url => {
  const url = new URL(typeof input === 'string' ? input : input.url);
  const { href, host, hostname, pathname } = url;
  const port = parseInt(url.port, 10);
  const isLocalhost = hostname === 'localhost';

  return {
    href,
    host,
    hostname,
    port: Number.isNaN(port) ? 80 : port,
    protocol: url.protocol.replace(/:$/, '') as t.Url['protocol'],
    path: pathname,
    hashstring: url.hash.replace(/^#/, ''),
    querystring: url.search.replace(/^\?/, ''),
    isLocalhost,

    toString() {
      return href;
    },

    query<T extends UrlQueryObject = UrlQueryObject>() {
      return QueryString.toObject<T>(url.search);
    },

    hash<T extends UrlQueryObject = UrlQueryObject>() {
      return QueryString.toObject<T>(url.hash);
    },
  };
};
