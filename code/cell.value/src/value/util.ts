export const isNilOrEmptyObject = (value: any, options: { ignoreHash?: boolean } = {}) => {
  if (value === null) {
    return true;
  } else {
    return value === undefined || isEmptyObject(value, options);
  }
};

export const isEmptyObject = (value: any, options: { ignoreHash?: boolean } = {}) => {
  if (typeof value !== 'object') {
    return false;
  }
  const keys = options.ignoreHash
    ? Object.keys(value).filter(key => key !== 'hash')
    : Object.keys(value);
  return keys.length === 0;
};
