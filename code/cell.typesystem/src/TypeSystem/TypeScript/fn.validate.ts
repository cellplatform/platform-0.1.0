import { deleteUndefined, value } from '../../common';

export const ERROR_TYPENAME = `Must be alpha-numeric with no spaces and start with a capital-letter.`;

/**
 * Validate the name of an object ("ns").
 */
export function objectTypename(input?: string) {
  const name = (input || '').trim();

  const done = (err?: string) => {
    const isValid = !err;
    const error = isValid ? undefined : `${err} ${ERROR_TYPENAME}`;
    return deleteUndefined({ isValid, input: name, error });
  };

  if (!name) {
    return done('Typename is empty.');
  }

  if (name[0] !== name[0].toUpperCase()) {
    return done('Typename is lowercase.');
  }

  if (name.match(/[^a-zA-Z0-9]/)) {
    return done('Typename contains invalid characters.');
  }

  if (value.isNumeric(name[0])) {
    return done('Typename starts with a number.');
  }

  return done(); // Is valid.
}
