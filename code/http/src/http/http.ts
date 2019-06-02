import { t, toRawHeaders, fromRawHeaders } from '../common';
import * as isomorphic from 'isomorphic-fetch';

/**
 * Native fetch.
 */
export const fetch = isomorphic;

export function create(defaultOptions: t.IFetchOptions = {}) {
  const http = {
    /**
     * `GET` request.
     */
    async get(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode = 'same-origin' } = { ...defaultOptions, ...options };
      const res = await isomorphic(url, {
        method: 'GET',
        headers: toRawHeaders(options.headers),
        mode,
      });

      const { ok, status, statusText } = res;
      const text = await res.text();

      const result: t.IHttpResponse<string> = {
        ok,
        status,
        statusText,
        get headers() {
          return fromRawHeaders(res.headers);
        },
        get body() {
          return text || '';
        },
      };

      return result;
    },
  };

  return http;
}

// export async function get(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
//   const { mode = 'same-origin' } = options;
//   const res = await isomorphic(url, {
//     method: 'GET',
//     headers: toRawHeaders(options.headers),
//     mode,
//   });

//   const { ok, status, statusText } = res;
//   const text = await res.text();

//   const result: t.IHttpResponse = {
//     ok,
//     status,
//     statusText,
//     get headers() {
//       return fromRawHeaders(res.headers);
//     },
//     get body() {
//       return text || '';
//     },
//   };

//   return result;
// }
