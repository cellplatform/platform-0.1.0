import * as t from './types';

/**
 * Determine if the status code represents an OK status (200).
 */
export function isOK(status: number | string = 200) {
  return status.toString().startsWith('2');
}

/**
 * Determine if the given input is an Observable.
 */
export function isObservable(input?: any) {
  return typeof input?.subscribe === 'function';
}

/**
 * Helpers for converting HTTP responses.
 */
export function fromHttpResponse(res: t.IHttpResponse) {
  return {
    /**
     * Convert raw HTTP response to the standard client-response object.
     */
    toClientResponse<T>(
      options: { bodyType?: t.HttpClientBodyType } = {},
    ): t.IHttpClientResponse<T> {
      const { bodyType = 'JSON' } = options;
      const { status } = res;

      let body: any = {};
      body = bodyType === 'JSON' ? res.json : body;
      body = bodyType === 'BINARY' ? res.body : body;
      body = bodyType === 'TEXT' ? res.text : body;

      return toClientResponse<T>(status, body);
    },
  };
}

/**
 * Prepare the standard client-response object.
 */
export function toClientResponse<T>(
  status: number,
  body: T,
  options: { bodyType?: t.HttpClientBodyType; error?: t.IHttpError } = {},
): t.IHttpClientResponse<T> {
  const { bodyType = 'JSON', error } = options;
  const ok = isOK(status);
  const res = { ok, status, body, bodyType, error };

  if (ok) {
    return res;
  } else {
    if (isError(body)) {
      // NB:  The body that has been returned is an [IHttpError] rather than
      //      the expected return object. Wrangle the response to return this
      //      as a standard error structure with no body content.
      const error = (body as unknown) as t.IHttpError;
      return toError<any>(error.status, error.type, error.message, {});
    } else {
      return res;
    }
  }
}

/**
 * Prepare the standard client-response error object.
 */
export function toError<T>(
  status: number,
  type: t.HttpError | t.FsHttpError,
  message: string,
  body?: T,
): t.IHttpClientResponse<T> {
  const error = { status, type, message };
  status = isOK(status) ? 500 : status; // NB: Ensure no OK status is handed back with the error.
  body = body || (({} as unknown) as T); // HACK typescript sanity - because this is an error the calling code should beware.
  const res = { ok: false, status, body, bodyType: 'JSON', error };
  return res as t.IHttpClientResponse<T>;
}

/**
 * Determine if the given body data is the shape of an IError.
 */
export function isError(data?: any) {
  return (
    data &&
    typeof data.status === 'number' &&
    typeof data.message === 'string' &&
    typeof data.type === 'string' &&
    !isOK(data.status)
  );
}
