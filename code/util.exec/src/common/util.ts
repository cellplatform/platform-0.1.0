import * as ansiRegex from 'ansi-regex';

/**
 * Removes ANSI color coding values from a string.
 */
export function stripAnsiColors(value: string) {
  return typeof value === 'string' ? value.replace(ansiRegex(), '') : value;
}

/**
 * Defines props for the given object.
 */
export function definedPropsFor<T>(obj: Partial<T>) {
  return <K extends keyof T>(name: K, get: () => T[K]) => Object.defineProperty(obj, name, { get });
}
