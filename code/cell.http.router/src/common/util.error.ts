import { ERROR } from './constants';
import { defaultValue, value } from './libs';
import * as t from './types';

/**
 * Convert an error into an HTTP response payload.
 */
export function toErrorPayload(
  err: Error | string,
  options: { status?: number; type?: t.HttpError | t.FsError; children?: t.IError[] } = {},
): t.IErrorPayload {
  const { children } = options;
  const status = defaultValue(options.status, 500);
  const type = options.type || status === 404 ? ERROR.HTTP.NOT_FOUND : ERROR.HTTP.SERVER;
  const message = typeof err === 'string' ? err : err.message;
  const data: any = value.deleteUndefined({ status, type, message, children });
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
