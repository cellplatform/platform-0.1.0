import { deleteUndefined, value } from '../../common';

export const ERROR_TYPENAME = `Must be alpha-numeric and start with a capital-letter.`;
export const ERROR_PROPNAME = `Must be alpha-numeric and not start with a number.`;

/**
 * Validate the name of an object ("ns").
 */
export function objectTypename(input: string | undefined) {
  const text = (input || '').trim();

  const done = (err?: string) => {
    const isValid = !err;
    const error = isValid ? undefined : `${err} ${ERROR_TYPENAME} (given "${text}")`;
    return deleteUndefined({ isValid, input: text, error });
  };

  if (!text) {
    return done('Typename is empty.');
  }

  if (text[0] !== text[0].toUpperCase()) {
    return done('Typename is lowercase.');
  }

  if (text.match(/[^a-zA-Z0-9]/)) {
    return done('Typename contains invalid characters.');
  }

  if (value.isNumeric(text[0])) {
    return done('Typename starts with a number.');
  }

  return done(); // is-valid.
}

/**
 * Validate a property-name.
 */
export function propname(input: string | undefined) {
  const text = (input || '').trim();

  const done = (err?: string) => {
    const isValid = !err;
    const error = isValid ? undefined : `${err} ${ERROR_PROPNAME} (given "${text}")`;
    return deleteUndefined({ isValid, input: text, error });
  };

  if (!text) {
    return done('Property-name is empty.');
  }

  if (text.match(/[^a-zA-Z0-9]/)) {
    return done('Property-name contains invalid characters.');
  }

  if (value.isNumeric(text[0])) {
    return done('Property-name starts with a number.');
  }

  return done(); // is-valid.
}
