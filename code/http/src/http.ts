import { t, value as valueUtil } from './common';
import * as isomorphic from 'isomorphic-fetch';

/**
 * Native fetch.
 */
export const fetch = isomorphic;

/**
 * `GET` request.
 */
export async function get(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
  const res = await isomorphic(url, {
    method: 'GET',
    headers: toRawHeaders(options.headers),
  });

  const { ok, status, statusText } = res;
  const text = await res.text();

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
  };

  return result;
}

/**
 * [Helpers]
 */

function toRawHeaders(input?: t.IHttpHeaders) {
  const obj = { ...(input || {}) } as any;
  Object.keys(obj).forEach(key => {
    obj[key] = obj[key].toString();
  });
  return new Headers(obj);
}

function fromRawHeaders(input: Headers): t.IHttpHeaders {
  const obj = ((input as any) || {})._headers || {};
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = valueUtil.toType(obj[key][0]);
    return acc;
  }, {});
}
