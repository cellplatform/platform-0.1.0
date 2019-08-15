import { value } from './libs';
import * as t from '../types';
import { IS_PROD } from './constants';

export function toRawHeaders(input?: t.IHttpHeaders) {
  const obj = { ...(input || {}) } as any;
  Object.keys(obj).forEach(key => {
    obj[key] = obj[key].toString();
  });
  return new Headers(obj);
}

export function fromRawHeaders(input: Headers): t.IHttpHeaders {
  const obj = ((input as any) || {})._headers || {};
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = value.toType(obj[key][0]);
    return acc;
  }, {});
}

export function stringify(data: any, errorMessage: () => string) {
  try {
    return data ? JSON.stringify(data) : undefined;
  } catch (err) {
    let message = errorMessage();
    message = !IS_PROD ? `${message} ${err.message}` : message;
    throw new Error(message);
  }
}
