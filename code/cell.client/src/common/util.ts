import * as t from './types';

/**
 * Prepare the standard client-response object.
 */
export function toResponse<T>(
  res: t.IHttpResponse,
  options: { bodyType?: 'JSON' | 'BINARY' } = {},
): t.IClientResponse<T> {
  const { bodyType = 'JSON' } = options;
  const { ok, status } = res;

  let body: any = {};
  body = bodyType === 'JSON' ? res.json : body;
  body = bodyType === 'BINARY' ? res.body : body;

  return { ok, status, body: body as T };
}

/**
 * Prepare the standard client-response error object.
 */
export function toError<T>(status: number, type: string, message: string): t.IClientResponse<T> {
  const error: t.IHttpError = { status, type, message };
  const ok = false;
  const body = ({} as unknown) as T; // HACK typescript sanity - because this is an error the calling code should beware.
  return { ok, status, body, error };
}
