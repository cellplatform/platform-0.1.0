import { IS_PROD } from './constants';
import { Mime, value as valueUtil } from './libs';
import * as t from './types';

/**
 * Safely serializes data to a JSON string.
 */
export function stringify(data: any, errorMessage: () => string) {
  try {
    return data ? JSON.stringify(data) : '';
  } catch (err) {
    let message = errorMessage();
    message = !IS_PROD ? `${message} ${err.message}` : message;
    throw new Error(message);
  }
}

/**
 * Attempts to parse JSON.
 */
export function parseJson(args: { url: string; text: string }) {
  const text = args.text;
  try {
    return (typeof text === 'string' && valueUtil.isJson(args.text)
      ? JSON.parse(text)
      : text) as t.Json;
  } catch (error) {
    const body = text ? text : '<empty>';
    const msg = `Failed while parsing JSON for '${args.url}'.\nParse Error: ${error.message}\nBody: ${body}`;
    throw new Error(msg);
  }
}

/**
 * Converts a simple object to a raw fetch [Headers].
 */
export function toRawHeaders(input?: t.IHttpHeaders) {
  const obj = { ...(input || {}) } as any;
  Object.keys(obj).forEach(key => {
    obj[key] = obj[key].toString();
  });
  return new Headers(obj);
}

/**
 * Converts fetch [Headers] to a simple object.
 */
export function fromRawHeaders(input: Headers): t.IHttpHeaders {
  const hasEntries = typeof input.entries === 'function';

  const obj = hasEntries
    ? walkHeaderEntries(input) // NB: Properly formed fetch object (probably in browser)
    : ((input as any) || {})._headers || {}; // HACK: reach into the server object's internals.

  return Object.keys(obj).reduce((acc, key) => {
    const value = Array.isArray(obj[key]) ? obj[key][0] : obj[key];
    acc[key] = valueUtil.toType(value);
    return acc;
  }, {});
}

const walkHeaderEntries = (input: Headers) => {
  const res: t.IHttpHeaders = {};
  const entries = input.entries();
  let next: IteratorResult<[string, string], any> | undefined;
  do {
    next = entries.next();
    if (next.value) {
      const [key, value] = next.value;
      res[key] = value;
    }
  } while (!next?.done);
  return res;
};

/**
 * Retrieve the value for the given header.
 */
export function getHeader(key: string, headers: t.IHttpHeaders = {}) {
  key = key.trim().toLowerCase();
  const match =
    Object.keys(headers)
      .filter(k => k.trim().toLowerCase() === key)
      .find(k => headers[k]) || '';
  return match ? headers[match] : '';
}

/**
 * Determine if the given headers reperesents form data.
 */
export function isFormData(headers: t.IHttpHeaders = {}) {
  const contentType = getHeader('content-type', headers);
  return contentType.includes('multipart/form-data');
}

/**
 * Convert a "response like" object to a proper [HttpResponse] object.
 */
export async function toResponse(url: string, res: t.IHttpResponseLike) {
  const { ok, status, statusText } = res;

  const body = res.body || undefined;
  const headers = fromRawHeaders(res.headers);
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

export function toContentType(headers: t.IHttpHeaders) {
  const value = (headers['content-type'] || '').toString();
  const res: t.IHttpContentType = {
    value,
    is: {
      get json() {
        return Mime.isJson(value);
      },
      get text() {
        return Mime.isText(value);
      },
      get binary() {
        return Mime.isBinary(value);
      },
    },
  };
  return res;
}
