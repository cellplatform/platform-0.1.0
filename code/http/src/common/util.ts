import { value } from './libs';
import * as t from './types';
import { IS_PROD } from './constants';

/**
 * Safely serializes data to a JSON string.
 */
export function stringify(data: any, errorMessage: () => string) {
  try {
    return data ? JSON.stringify(data) : undefined;
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
  try {
    return JSON.parse(args.text) as t.Json;
  } catch (error) {
    const body = args.text ? args.text : '<empty>';
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
  const obj = ((input as any) || {})._headers || {};
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = value.toType(obj[key][0]);
    return acc;
  }, {});
}

/**
 * Determine if the given headers reperesents form data.
 */
export function isFormData(input: Headers) {
  const contentType = input.get('content-type') || '';
  return contentType.includes('multipart/form-data');
}

export function toBody(args: { url: string; headers: Headers; data?: any }) {
  const { url, headers, data } = args;
  if (isFormData(headers)) {
    return data;
  }
  return stringify(
    data,
    () => `Failed to POST to '${url}', the data could not be serialized to JSON.`,
  );
}

export async function toResponse(url: string, res: t.IHttpResponseLike) {
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

export function toContentType(headers: t.IHttpHeaders) {
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
