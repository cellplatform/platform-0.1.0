import { value } from '../common';

/**
 * Removes GraqphQL type annotation fields.
 */
export function clean<T>(input: T, options: { deep?: boolean } = {}) {
  const deep = value.defaultValue(options.deep, true);

  if (!input || typeof input !== 'object') {
    return input;
  }

  const clean = (obj: any) => {
    if (obj && typeof obj === 'object') {
      delete obj.__typename;
    }
  };

  if (deep && input && typeof input === 'object') {
    value.object.walk(input, obj => {
      clean(obj);
    });
  }

  clean(input);
  return input as T;
}
