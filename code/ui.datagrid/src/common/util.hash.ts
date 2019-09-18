const lib = require('object-hash');

const options = {
  algorithm: 'sha1',
};

/**
 * Crate a hash from an object.
 */
export function hash(value?: any) {
  value = value === undefined ? '' : value;
  return lib(value, options);
}
