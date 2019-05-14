import * as t from '../types';
const isomorphic = require('isomorphic-fetch');

/**
 * Wrapper around fetch.
 */
export function fetcher(args: { headers?: (headers?: t.IHttpHeaders) => Promise<t.IHttpHeaders> }) {
  return async (url: string, options: { headers: t.IHttpHeaders }) => {
    options.headers = args.headers ? await args.headers(options.headers) : options.headers;
    return isomorphic(url, options);
  };
}
