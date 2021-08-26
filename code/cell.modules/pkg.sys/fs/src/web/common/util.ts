import * as t from './types';

/**
 * Standard JSON stringify format.
 */
export function stringify(input: t.Json) {
  return `${JSON.stringify(input, null, '  ')}\n`;
}
