import { t, toRawHeaders, fromRawHeaders } from '../common';
import * as isomorphic from 'isomorphic-fetch';

/**
 * Native fetch.
 */
export const fetch = isomorphic;

export function create(options: t.IFetchOptions = {}) {
  const baseOptions = options;
  const http = {
    create,
    fetch,

    /**
     * `GET` request.
     */
    async get(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode = 'cors' } = { ...baseOptions, ...options };
      const res = await isomorphic(url, {
        method: 'GET',
        headers: toRawHeaders(options.headers),
        mode,
      });

      const { ok, status, statusText } = res;
      const text = await res.text();
      let json: any;

      const result: t.IHttpResponse = {
        ok,
        status,
        statusText,
        get headers() {
          return fromRawHeaders(res.headers);
        },
        get body() {
          return text || '';
        },
        json<T>() {
          if (!json) {
            try {
              json = JSON.parse(result.body) as T;
            } catch (error) {
              throw new Error(`Failed while parsing JSON for '${url}'. ${error.message}`);
            }
          }
          return json;
        },
      };

      return result;
    },
  };

  return http;
}
