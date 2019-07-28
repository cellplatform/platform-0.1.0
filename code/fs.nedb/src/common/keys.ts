import { R } from './libs';

/**
 * Escapes illegal characters from a JSON field key.
 */
export function encodeKey(input: string): string {
  input = input.replace(/\./g, '\\'); // Period (.) characters are not allowed.
  return input;
}
function shouldEncode(input: string) {
  return input.includes('.');
}

/**
 * Converts escaped key values back to their original form.
 */
export function decodeKey(input: string): string {
  input = input.replace(/\\/g, '.');
  return input;
}
function shouldDecode(input: string) {
  return input.includes('\\');
}

/**
 * Encodes all keys on the given object.
 */
export function encodeObjectKeys<T extends object>(input: T | T[]): T | T[] {
  return changeObjectKeys<T>(input, shouldEncode, encodeKey);
}

/**
 * Decodes keys on all objects.
 */
export function decodeObjectKeys<T extends object>(input: T | T[]): T | T[] {
  return changeObjectKeys<T>(input, shouldDecode, decodeKey);
}

/**
 * Ensures keys are prefixed.
 */
export function prefixFilterKeys<T extends object>(prefix: string, input: T) {
  return changeObjectKeys(input, key => !key.startsWith('$'), key => `${prefix}.${key}`);
}

/**
 * [Helpers]
 */

function changeObjectKeys<T extends object>(
  input: T | T[],
  shouldChange: (input: string) => boolean,
  transformKey: (input: string) => string,
): T | T[] {
  if (!R.is(Object, input)) {
    return input;
  }

  if (Array.isArray(input)) {
    const list = input.map(item =>
      R.is(Object, item)
        ? changeObjectKeys<T>(item, shouldChange, transformKey) // <== 🌳 RECURSION
        : item,
    );
    return list as T[];
  }

  const isCloned = false;
  let res = input;
  Object.keys(input).forEach(key => {
    res = isCloned ? res : { ...res }; // NB: Lazily clone only if necessary (for efficiency).
    if (shouldChange(key)) {
      // Transform the key.
      const value = R.is(Object, input[key])
        ? changeObjectKeys<T>(input[key], shouldChange, transformKey) // <== 🌳 RECURSION
        : input[key];
      delete res[key];
      res[transformKey(key)] = value;
    } else if (R.is(Object, input[key])) {
      // No transform required on this key, ensure children are changed.
      res[key] = changeObjectKeys<T>(input[key], shouldChange, transformKey); // <== 🌳 RECURSION
    }
  });
  return res;
}
