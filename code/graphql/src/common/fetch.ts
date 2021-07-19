import * as t from './types';
import * as fetch from 'isomorphic-fetch';

type GetHeaders = (headers?: t.HttpHeaders) => Promise<t.HttpHeaders>;

/**
 * Wrapper around fetch that injects custom headers
 * for each request.
 */
export function fetcher(args: { headers?: GetHeaders }) {
  return async (url: string, options: { headers: t.HttpHeaders }) => {
    options.headers = args.headers ? await args.headers(options.headers) : options.headers;
    return fetch(url, options as any);
  };
}
