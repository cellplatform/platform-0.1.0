import { IS_PROD } from './constants';
import * as t from './types';
import { value as valueUtil, Mime, Headers } from '../common';

/**
 * Safely serializes data to a JSON string.
 */
export function stringify(data: any, errorMessage: () => string) {
  try {
    return data ? JSON.stringify(data) : '';
  } catch (err: any) {
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
    return (
      typeof text === 'string' && valueUtil.isJson(args.text) ? JSON.parse(text) : text
    ) as t.Json;
  } catch (error: any) {
    const body = text ? text : '<empty>';
    const msg = `Failed while parsing JSON for '${args.url}'.\nParse Error: ${error.message}\nBody: ${body}`;
    throw new Error(msg);
  }
}

/**
 * Converts a simple object to a raw fetch [Headers].
 */
export function toRawHeaders(input?: t.HttpHeaders) {
  const obj = { ...(input || {}) } as any;
  Object.keys(obj).forEach((key) => {
    obj[key] = obj[key].toString();
  });
  return new Headers(obj);
}

/**
 * Converts fetch [Headers] to a simple object.
 */
export function fromRawHeaders(input: Headers): t.HttpHeaders {
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
  const res: t.HttpHeaders = {};
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
export function headerValue(key: string, headers: t.HttpHeaders = {}) {
  key = key.trim().toLowerCase();
  const match =
    Object.keys(headers)
      .filter((k) => k.trim().toLowerCase() === key)
      .find((k) => headers[k]) || '';
  return match ? headers[match] : '';
}

/**
 * Determine if the given headers reperesents form data.
 */
export function isFormData(headers: t.HttpHeaders = {}) {
  const contentType = headerValue('content-type', headers);
  return contentType.includes('multipart/form-data');
}

/**
 * Determine if the given body value represents a stream.
 */
export function isStream(value?: ReadableStream<Uint8Array>) {
  const stream = value as any;
  return typeof stream?.pipe === 'function';
}

export const response = {
  /**
   * Convert a [HttpRespondPayload] fetch result to a proper [HttpResponse] object.
   */
  async fromPayload(
    payload: t.HttpRespondPayload,
    modifications: { data?: any; headers?: t.HttpHeaders } = {},
  ) {
    const { status, statusText = '' } = payload;
    const data = payload.data || modifications.data;

    let head = payload.headers || modifications.headers || {};
    if (data && !headerValue('content-type', head)) {
      head = {
        ...head,
        'content-type': isStream(data) ? 'application/octet-stream' : 'application/json',
      };
    }

    const contentType = headerValue('content-type', head);
    const isBinary = Mime.isBinary(contentType);

    const toText = (data: any) => {
      if (!data) {
        return '';
      }
      if (typeof data === 'string') {
        return data;
      }
      return stringify(data, () => `Failed while serializing data to JSON within [text] method.`);
    };

    const toJson = (data: any) => {
      return data && !isBinary ? data : '';
    };

    let text = '';
    let json = '';

    const res: t.HttpFetchResponse = {
      status,
      statusText,
      headers: toRawHeaders(head),
      body: isBinary ? data : null,
      async text() {
        return text || (text = toText(data));
      },
      async json() {
        return json || (json = toJson(data));
      },
    };

    return response.fromFetch(res);
  },

  /**
   * Convert a "response like" fetch result to a proper [HttpResponse] object.
   */
  async fromFetch(res: t.HttpFetchResponse) {
    const { status } = res;
    const ok = status.toString()[0] === '2';
    const body = res.body || undefined;
    const statusText = res.statusText ? res.statusText : ok ? 'OK' : '';

    const headers = fromRawHeaders(res.headers);
    const contentType = response.toContentType(headers);

    const text = contentType.is.text ? await res.text() : '';
    const json = contentType.is.json ? await res.json() : '';

    const result: t.HttpResponse = {
      ok,
      status,
      statusText,
      headers,
      contentType,
      body,
      text,
      json,
    };

    return result;
  },

  /**
   * Derives content-type details from the given headers.
   */
  toContentType(headers: t.HttpHeaders): t.HttpContentType {
    const mime = headerValue('content-type', headers);
    const res: t.HttpContentType = {
      mime,
      is: {
        get json() {
          return Mime.isJson(mime);
        },
        get text() {
          return Mime.isText(mime);
        },
        get binary() {
          return Mime.isBinary(mime);
        },
      },
      toString() {
        return mime;
      },
    };
    return res;
  },
};
