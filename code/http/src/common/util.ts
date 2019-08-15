import { value } from './libs';
import * as t from '../types';
import { IS_PROD } from './constants';

/**
 * Converts a simple object to a raw fetch [Headers].
 */
export function toRawHeaders(input?: t.IHttpHeaders) {
  const obj = { ...(input || {}) } as any;
  Object.keys(obj).forEach(key => {
    obj[key] = obj[key].toString();
  });
  return new Headers(obj);
}

/**
 * Converts fetch [Headers] to a simple object.
 */
export function fromRawHeaders(input: Headers): t.IHttpHeaders {
  const obj = ((input as any) || {})._headers || {};
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = value.toType(obj[key][0]);
    return acc;
  }, {});
}

/**
 * Safely serializes data to a JSON string.
 */
export function stringify(data: any, errorMessage: () => string) {
  try {
    return data ? JSON.stringify(data) : undefined;
  } catch (err) {
    let message = errorMessage();
    message = !IS_PROD ? `${message} ${err.message}` : message;
    throw new Error(message);
  }
}
