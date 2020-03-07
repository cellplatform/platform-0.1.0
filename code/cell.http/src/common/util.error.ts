import { ERROR } from './constants';
import { defaultValue } from './libs';
import * as t from './types';

/**
 * Convert an error into an HTTP response payload.
 */
export function toErrorPayload(
  err: Error | string,
  options: { status?: number; type?: t.HttpError | t.FsError } = {},
): t.IErrorPayload {
  const status = defaultValue(options.status, 500);
  const type = options.type || ERROR.HTTP.SERVER;
  const message = typeof err === 'string' ? err : err.message;
  const data: any = { status, type, message };
  return {
    status,
    data,
  };
}

/**
 * Determines if the given object represents an error payload.
 */
export function isErrorPayload(input: any) {
  if (input === null || typeof input !== 'object') {
    return false;
  }
  if (typeof input.status !== 'number') {
    return false;
  }
  return isHttpError(input.data);
}

/**
 * Determines if the given object represent an error.
 */
export function isHttpError(input: any) {
  if (input === null || typeof input !== 'object') {
    return false;
  }
  return (
    typeof input.status === 'number' &&
    typeof input.message === 'string' &&
    typeof input.type === 'string'
  );
}
