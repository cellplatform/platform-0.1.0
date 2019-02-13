import { R } from '../common';
import { isBlank } from './value.is';

/**
 * Converts a value to a number if possible.
 * @param value: The value to convert.
 * @returns the converted number, otherwise the original value.
 */
export function toNumber(value: any) {
  if (isBlank(value)) {
    return value;
  }
  const num = parseFloat(value);
  if (num === undefined) {
    return value;
  }
  if (num.toString().length !== value.toString().length) {
    return value;
  }
  return Number.isNaN(num) ? value : num;
}

/**
 * Converts a value to boolean (if it can).
 * @param value: The value to convert.
 * @param defaultValue: The value to return if the given value is null/undefined.
 * @returns the converted boolean, otherwise the original value.
 */
export function toBool(value: any, defaultValue?: any) {
  if (R.isNil(value)) {
    return defaultValue;
  }
  if (R.is(Boolean, value)) {
    return value;
  }
  const asString = value
    .toString()
    .trim()
    .toLowerCase();
  if (asString === 'true') {
    return true;
  }
  if (asString === 'false') {
    return false;
  }
  return defaultValue;
}

/**
 * Converts a string to it's actual type if it can be derived.
 * @param {string} string: The string to convert.
 * @return the original or converted value.
 */
export function toType<T>(value: any) {
  if (!R.is(String, value)) {
    return value as T;
  }
  const lowerCase = value.toLowerCase().trim();

  // Boolean.
  if (lowerCase === 'true') {
    return true;
  }
  if (lowerCase === 'false') {
    return false;
  }

  // Number.
  const num = toNumber(lowerCase);
  if (R.is(Number, num)) {
    return num as T;
  }

  // Originanl type.
  return value as T;
}
