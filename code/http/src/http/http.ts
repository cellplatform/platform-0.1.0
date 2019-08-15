import { t, toRawHeaders, fromRawHeaders } from '../common';
import * as isomorphic from 'isomorphic-fetch';

/**
 * Native fetch.
 */
export const fetch = isomorphic;

export function create(options: t.IFetchOptions = {}) {
  const mergeOptions = (methodOptions: t.IFetchOptions) => {
    const res = { ...options, ...methodOptions };
    const { mode = 'cors' } = res;
    const headers = toRawHeaders(res.headers);
    return { mode, headers };
  };

  const http = {
    create,
    fetch,

    /**
     * `GET` request.
     */
    async get(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const res = await isomorphic(url, { method: 'GET', headers, mode });
      return toResponse(url, res);
    },
  };

  /**
   * [API]
   */
  return http;
}

/**
 * [Helpers]
 */

async function toResponse(url: string, res: Response) {
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
}
