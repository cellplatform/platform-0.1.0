import * as t from './types';
import { fs, cell, defaultValue } from './libs';

export * from './libs';
export const env = fs.env;
export const resolve = fs.resolve;

export { cell };
export const hash = cell.value.hash;
export const squash = cell.value.squash;

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

/**
 * Determines if the given string is an HTTP link.
 */
export function isHttp(input: string = '') {
  return input.startsWith('https://') || input.startsWith('http://');
}

export function isFile(input: string = '') {
  return input.startsWith('file://');
}
