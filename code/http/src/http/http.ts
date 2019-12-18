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

    /**
     * `PUT`
     */
    async put(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const body = toBody({ url, headers, data });
      const res = await isomorphic(url, { method: 'PUT', body, headers, mode });
      return toResponse(url, res);
    },

    /**
     * `DELETE`
     */
    async delete(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const res = await isomorphic(url, { method: 'DELETE', headers, mode });
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
  const contentType = toContentType(headers);
  const is = contentType.is;
  const text = is.text || is.json ? await res.text() : '';
  let json: any;

  const result: t.IHttpResponse = {
    ok,
    status,
    statusText,
    headers,
    contentType,
    body,
    text,
    get json() {
      return json || (json = parseJson({ url, text }));
    },
  };

  return result;
}

/**
 * Helpers
 */

function toContentType(headers: t.IHttpHeaders) {
  const value = (headers['content-type'] || '').toString();
  const res: t.IHttpContentType = {
    value,
    is: {
      get json() {
        return value.includes('application/json');
      },
      get text() {
        return value.includes('text/');
      },
      get binary() {
        return !res.is.json && !res.is.text;
      },
    },
  };
  return res;
}

function parseJson(args: { url: string; text: string }) {
  try {
    return JSON.parse(args.text) as t.Json;
  } catch (error) {
    const body = args.text ? args.text : '<empty>';
    const msg = `Failed while parsing JSON for '${args.url}'.\nParse Error: ${error.message}\nBody: ${body}`;
    throw new Error(msg);
  }
}
