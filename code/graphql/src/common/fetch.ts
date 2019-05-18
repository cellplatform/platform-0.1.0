import * as t from '../types';
import { http } from './libs';

type GetHeaders = (headers?: t.IHttpHeaders) => Promise<t.IHttpHeaders>;

/**
 * Wrapper around fetch that injects custom headers
 * for each request.
 */
export function fetcher(args: { headers?: GetHeaders }) {
  return async (url: string, options: { headers: t.IHttpHeaders }) => {
    options.headers = args.headers ? await args.headers(options.headers) : options.headers;
    return http.fetch(url, options as any);
  };
}
