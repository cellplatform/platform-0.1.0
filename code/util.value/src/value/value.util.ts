/**
 * Conveninent way of processing a value and flipping to a default value if it doesn't exist.
 */
export function defaultValue<T>(value: T | undefined, defaultValue?: T) {
  return (value === undefined ? defaultValue : value) as T;
}

/**
 * Deletes undefined keys from an object (clone).
 */
export function deleteUndefined<T extends object>(obj: T) {
  obj = { ...(obj as any) };
  Object.keys(obj)
    .filter(key => obj[key] === undefined)
    .forEach(key => delete obj[key]);
  return obj;
}

/**
 * Deletes empty keys from an object (clone).
 */
export function deleteEmpty<T extends object>(obj: T) {
  obj = { ...(obj as any) };
  Object.keys(obj)
    .filter(key => obj[key] === undefined || obj[key] === '')
    .forEach(key => delete obj[key]);
  return obj;
}

/**
 * Determines whether an HTTP status is OK.
 */
export const isStatusOk = (status: number) => {
  return status === undefined ? false : status.toString().startsWith('2');
};
