import * as ansiRegex from 'ansi-regex';

/**
 * Removes ANSI color coding values from a string.
 */
export function stripAnsiColors(value: string) {
  return typeof value === 'string' ? value.replace(ansiRegex(), '') : value;
}
