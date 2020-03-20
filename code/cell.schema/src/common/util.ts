/**
 * Determines if the given string is an HTTP link.
 */
export function isHttp(input: string = '') {
  input = input.trim();
  return input.startsWith('https://') || input.startsWith('http://');
}

/**
 * Determine if the given object is null/undefined of empty ({})
 */
export const isNilOrEmptyObject = (value: any, options: { ignoreHash?: boolean } = {}) => {
  if (value === null) {
    return true;
  } else {
    return value === undefined || isEmptyObject(value, options);
  }
};

/**
 * Determine if the given object is empty ({})
 */
export const isEmptyObject = (value: any, options: { ignoreHash?: boolean } = {}) => {
  if (typeof value !== 'object') {
    return false;
  }
  const keys = options.ignoreHash
    ? Object.keys(value).filter(key => key !== 'hash')
    : Object.keys(value);
  return keys.length === 0;
};
