/**
 * Conveninent way of processing a value and flipping to a default value if it doesn't exist.
 */
export function defaultValue<T>(value: T | undefined, defaultValue?: T) {
  return (value === undefined ? defaultValue : value) as T;
}
