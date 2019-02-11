import { IResult } from '../types';

/**
 * Prepare a success response.
 */
export function success(): IResult {
  return format({ code: 0 });
}

/**
 * Prepares a failure response.
 */
export function fail(err: string | Error, code?: number): IResult {
  const message = typeof err === 'string' ? err : err.message;
  code = code === undefined || code === 1 ? 1 : code;
  const error = new Error(message);
  return format({ code, error });
}

/**
 * Ensure a result object is valid.
 */
export function format(result: Partial<IResult>): IResult {
  const code = result.code === undefined ? 0 : result.code;
  const error = result.error;
  const ok = !error && code === 0;
  return error ? { ok, code, error } : { ok, code };
}
