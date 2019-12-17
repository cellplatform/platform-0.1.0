import * as t from './types';
import { ERROR } from './constants';

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

  return ok ? { ok, status, body: body as T } : toError(500, ERROR.HTTP.SERVER, `Failed`, body);
}

/**
 * Prepare the standard client-response error object.
 */
export function toError<T>(
  status: number,
  type: string,
  message: string,
  body?: T,
): t.IClientResponse<T> {
  const error: t.IHttpError = { status, type, message };
  const ok = false;
  body = body || (({} as unknown) as T); // HACK typescript sanity - because this is an error the calling code should beware.
  return { ok, status, body, error };
}
