import {
  t,
  fetch,
  toRawHeaders,
  fromRawHeaders,
  stringify,
  isFormData,
  parseJson,
} from '../common';
export { fetch };

/**
 * Native fetch.
 */

export const create: t.HttpCreate = (options = {}) => {
  const mergeOptions = (methodOptions: t.IFetchOptions) => {
    const args = { ...options, ...methodOptions };
    const { mode = 'cors' } = args;
    const headers = toRawHeaders(args.headers);
    return { mode, headers };
  };

  const http: t.IHttp = {
    create,

    get headers() {
      return { ...options.headers };
    },

    /**
     * `HEAD`
     */
    async head(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const res = await fetch(url, { method: 'HEAD', headers, mode });
      return toResponse(url, res);
    },

    /**
     * `GET`
     */
    async get(url: string, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const res = await fetch(url, { method: 'GET', headers, mode });
      return toResponse(url, res);
    },

    /**
     * `PUT`
     */
    async put(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const body = toBody({ url, headers, data });
      const res = await fetch(url, { method: 'PUT', body, headers, mode });
      return toResponse(url, res);
    },

    /**
     * `POST`
     */
    async post(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const body = toBody({ url, headers, data });
      const res = await fetch(url, { method: 'POST', body, headers, mode });
      return toResponse(url, res);
    },

    /**
     * `PATCH`
     */
    async patch(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const body = toBody({ url, headers, data });
      const res = await fetch(url, { method: 'PATCH', body, headers, mode });
      return toResponse(url, res);
    },

    /**
     * `DELETE`
     */
    async delete(url: string, data?: any, options: t.IFetchOptions = {}): Promise<t.IHttpResponse> {
      const { mode, headers } = mergeOptions(options);
      const body = toBody({ url, headers, data });
      const res = await fetch(url, { method: 'DELETE', body, headers, mode });
      return toResponse(url, res);
    },
  };
  return http;
};

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
