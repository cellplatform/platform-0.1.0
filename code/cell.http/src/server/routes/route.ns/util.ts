export * from '../../common/util';

export const formatQueryArray = (input: Array<string | boolean>) => {
  if (input.some(item => item === false)) {
    // NB: Any explicit FALSE refs win.
    // The operation is not wanted irrespective of other requests.
    return false;
  }

  if (input.some(item => item === true)) {
    // NB: Any occurance of `true` negates narrower string ranges
    //     so default to a blunt `true` so everything is returned.
    return true;
  }

  // Convert array of string to a single-flat-string.
  const flat = input.filter(item => typeof item === 'string').join(',');
  return flat ? flat : undefined;
};

export const formatQuery = (
  input?: boolean | string | Array<string | boolean>,
): string | boolean | undefined => {
  return Array.isArray(input) ? formatQueryArray(input) : input;
};
