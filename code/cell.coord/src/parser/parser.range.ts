import { R } from '../common';

export const toRangeParts = R.memoizeWith(R.identity, parse);

/**
 * Extracts constituent parts from a range key.
 */
export function parse(value: string) {
  if (value === undefined) {
    throw new Error(`Cannot parse range, key value not provided.`);
  }
  value = value.trim();
  const error = (message: string) => `INVALID RANGE "${value}". ${message}`;
  let result = { left: value, right: '', error: '', isValid: true };

  const parts = value.split(':');
  if (!value || parts.length < 2) {
    result.error = error(`Not enough range data to parse.`);
  }
  if (parts.length > 2) {
    result.error = error(`Two many parts to the range, should only be 2 (eg "A1:B3").`);
  }

  if (!result.error) {
    result.left = parts[0] ? parts[0].trim() : '';
    result.right = parts[1] ? parts[1].trim() : '';
    result =
      !result.left || !result.right
        ? { ...result, error: error('Does not have two range values.') }
        : result;
  }

  // Finish up.
  result = result.error ? { ...result, isValid: false } : result;
  return result;
}
