import { R } from '../common';
import { compact } from './value.array';

/**
 * Determines whether the value is a simple object (ie. not a class instance).
 * @param value: The value to examine.
 * @return {Boolean}.
 */
export function isPlainObject(value: any): boolean {
  if (R.is(Object, value) === false) {
    return false;
  }

  // Not plain if it has a modified constructor.
  const ctr = value.constructor;
  if (typeof ctr !== 'function') {
    return false;
  }

  // If has modified prototype.
  const prot = ctr.prototype;
  if (R.is(Object, prot) === false) {
    return false;
  }

  // If the constructor does not have an object-specific method.
  const hasOwnPropery = prot.hasOwnProperty('isPrototypeOf'); // eslint-disable-line
  if (hasOwnPropery === false) {
    return false;
  }

  // Finish up.
  return true;
}

/**
 * Determines if the given value is a boolean.
 */
export function isBoolString(value?: string) {
  const asString = (value || '').toString().trim().toLowerCase();
  return asString === 'true' || asString === 'false';
}

/**
 * Determines if the given value is [null].
 */
export function isNullString(value?: string) {
  const asString = (value || '').toString().trim().toLowerCase();
  return asString === 'null';
}

/**
 * Determines if the given value is [undefined].
 */
export function isUndefinedString(value?: string) {
  const asString = (value || '').toString().trim().toLowerCase();
  return asString === 'undefined';
}

/**
 * Check whether a string is likely to be a date.
 * Example:
 *
 *    `2019-03-07T21:07:33.062Z`
 *
 */
export function isDateString(value?: any) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const text = value;
  if (!text.endsWith('Z') && isNaN(text.charAt[0])) {
    return false;
  }
  return text.includes('-') && text.includes('T') && text.includes(':') && text.includes('.');
}

/**
 * A safe way to test any value as to wheather is is 'blank'
 * meaning it can be either:
 *   - null
 *   - undefined
 *   - empty-string ('')
 *   - empty-array ([]).
 */
export function isBlank(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (Array.isArray(value) && compact(value).length === 0) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  return false;
}

/**
 * Determines whether the given value is a number, or can be
 * parsed into a number.
 *
 * NOTE: Examines string values to see if they are numeric.
 *
 * @param value: The value to examine.
 * @returns true if the value is a number.
 */
export function isNumeric(value: any) {
  if (isBlank(value)) {
    return false;
  }
  const num = parseFloat(value);
  if (num === undefined) {
    return false;
  }
  if (num.toString().length !== value.toString().length) {
    return false;
  }
  return !Number.isNaN(num);
}

/**
 * Determines whether the given value is a single alphabetic letter.
 */
export function isLetter(value: any) {
  return isAlpha(value) && R.is(String, value) && (value as string).length === 1;
}

/**
 * Determines whether the given value is a alphabet letter.
 */
export function isAlpha(value: any) {
  if (isBlank(value) || !R.is(String, value)) {
    return false;
  }
  const text = value as string;
  if (text.length === 0) {
    return false;
  }
  return Boolean(text.match(/^[a-zA-Z]+$/g));
}

/**
 * Determines whether the given string contains whitespace.
 */
export function hasWhitespace(text: string) {
  return Boolean(text.match(/\s/g));
}

/**
 * Determines whether the given value is a Promise.
 */
export function isPromise(value?: any) {
  return value ? typeof value === 'object' && typeof value.then === 'function' : false;
}

/**
 * Determines whether the given value is a JSON string.
 */
export function isJson(value?: any) {
  if (typeof value !== 'string') {
    return false;
  }
  const text = (value as string).trim();
  return text.startsWith('{') || text.startsWith('[');
}

/**
 * Determines if a value is an ISO date.
 * See:
 *    https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
 */
export function isIsoDate(value?: string) {
  return value ? isoDateRegEx.test(value) : false;
}
const isoDateRegEx = new RegExp(
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
);

/**
 * Determines whether a string is a valid email address.
 */
export function isEmail(value?: string) {
  return value ? emailRegEx.test(value) : false;
}
const emailRegEx = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
);
