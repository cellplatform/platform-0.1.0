import * as t from './types';

/**
 * Conveninent way of processing a value and flipping to a default value if it doesn't exist.
 */
export function defaultValue<T>(value: T | undefined, defaultValue?: T): T {
  return (value === undefined ? defaultValue : value) as T;
}

/**
 * Standard JSON stringify format.
 */
export function stringify(input: t.Json) {
  return `${JSON.stringify(input, null, '  ')}\n`;
}
