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
