import { t, defaultValue } from '../common';

/**
 * Convert an error into an HTTP response payload.
 */
export function toErrorPayload(
  err: Error,
  options: { status?: number; type?: string } = {},
): t.IErrorPayload {
  const status = defaultValue(options.status, 500);
  const { type = 'HTTP/server' } = options;

  const data: t.IHttpError = {
    status,
    type,
    message: err.message,
  };

  return { status, data };
}
