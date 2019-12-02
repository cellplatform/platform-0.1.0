import * as t from './types';
import { fs, cell, defaultValue } from './libs';
import { ERROR } from './constants';

export * from './libs';
export * from './util.url';

export const env = fs.env;
export const resolve = fs.resolve;

export { cell };
export const hash = cell.value.hash;
export const squash = cell.value.squash;

/**
 * Convert an error into an HTTP response payload.
 */
export function toErrorPayload(
  err: Error | string,
  options: { status?: number; type?: string } = {},
): t.IErrorPayload {
  const status = defaultValue(options.status, 500);
  const { type = ERROR.SERVER } = options;
  const message = typeof err === 'string' ? err : err.message;
  const data: t.IHttpError = { status, type, message };
  return { status, data };
}

/**
 * Determines if the given string is an HTTP link.
 */
export function isHttp(input: string = '') {
  return input.startsWith('https://') || input.startsWith('http://');
}

/**
 * Determines if the given string is a FILE link.
 */
export function isFile(input: string = '') {
  return input.startsWith('file://');
}

/**
 * Determine if the status code represents an OK status (200).
 */
export function isOK(status: number | string = 200) {
  return status.toString().startsWith('2');
}
