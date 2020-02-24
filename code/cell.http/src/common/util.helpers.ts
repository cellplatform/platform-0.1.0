import * as mime from 'mime-types';

import { ERROR } from './constants';
import { defaultValue, time } from './libs';
import * as t from './types';

/**
 * Convert an error into an HTTP response payload.
 */
export function toErrorPayload(
  err: Error | string,
  options: { status?: number; type?: string } = {},
): t.IErrorPayload {
  const status = defaultValue(options.status, 500);
  const { type = ERROR.HTTP.SERVER } = options;
  const message = typeof err === 'string' ? err : err.message;
  const data: t.IHttpError = { status, type, message };
  return { status, data };
}

/**
 * Determine if the status code represents an OK status (200).
 */
export function isOK(status: number | string = 200) {
  return status.toString().startsWith('2');
}

/**
 * Determines if the given string is an HTTP link.
 */
export function isHttp(input: string = '') {
  input = input.trim();
  return input.startsWith('https://') || input.startsWith('http://');
}

/**
 * Determines if the given string is a FILE link.
 */
export function isFile(input: string = '') {
  return input.trim().startsWith('file://');
}

/**
 * Get the mime-type for the given filename.
 * Derived from extension.
 */
export function toMimetype(filename: string = '') {
  const type = mime.lookup((filename || '').trim());
  return typeof type === 'string' ? type : undefined;
}

/**
 * Converts to seconds.
 */
export function toSeconds(input?: number | string, defaultSeconds?: number) {
  const done = (sec?: number) => {
    return sec === undefined ? undefined : sec < 0 ? undefined : sec;
  };
  if (input === undefined) {
    return done(defaultSeconds);
  } else {
    return typeof input === 'number' ? done(input) : done(time.duration(input).sec);
  }
}
