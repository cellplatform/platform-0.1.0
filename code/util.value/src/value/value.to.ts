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
  if (value === null || value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'boolean') {
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
  if (!(typeof value === 'string')) {
    return value as T;
  }

  // Boolean.
  const lowerCase = value.toLowerCase().trim();
  if (lowerCase === 'true') {
    return true;
  }
  if (lowerCase === 'false') {
    return false;
  }

  // Number.
  const num = toNumber(lowerCase);
  if (typeof num === 'number') {
    return num;
  }

  // Original type.
  return (value as unknown) as T;
}
