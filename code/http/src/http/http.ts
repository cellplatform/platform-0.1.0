import { t, toRawHeaders, fromRawHeaders, stringify, isFormData } from '../common';
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
     * `GET`
     */
    async get(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const res = await isomorphic(url, { method: 'GET', headers, mode });
      return toResponse(url, res);
    },

    /**
     * `POST`
     */
    async post(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const body = toBody({ url, headers, data });
      const res = await isomorphic(url, { method: 'POST', body, headers, mode });
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

function toBody(args: { url: string; headers: Headers; data?: any }) {
  const { url, headers, data } = args;
  if (isFormData(headers)) {
    return data;
  }
  return stringify(
    data,
    () => `Failed to POST to '${url}', the data could not be serialized to JSON.`,
  );
}

async function toResponse(url: string, res: Response) {
  const { ok, status, statusText } = res;
  const headers = fromRawHeaders(res.headers);
  const body = res.body || undefined;
  const text = isTextBody(headers) ? await res.text() : '';
  let json: any;

  const result: t.IHttpResponse = {
    ok,
    status,
    statusText,
    headers,
    body,
    text,
    get json() {
      if (!json) {
        try {
          json = JSON.parse(result.text) as t.Json;
        } catch (error) {
          const msg = `Failed while parsing JSON for '${url}'.\nParse Error: ${error.message}\nBody: ${result.text}`;
          throw new Error(msg);
        }
      }
      return json;
    },
  };

  return result;
}

/**
 * Helpers
 */

function isTextBody(headers: t.IHttpHeaders) {
  const type = (headers['content-type'] || '').toString();
  return type === 'application/json' || type.startsWith('text/');
}
