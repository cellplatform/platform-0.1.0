import { value } from '../common';

export const validate = {
  scopename(input: string | undefined) {
    const text = (input || '').trim();

    const done = (err?: string) => {
      const RULE = `Must be alpha-numeric, underscore (_) or period (.) and not start with a number.`;
      const isValid = !err;
      const error = isValid ? undefined : `${err} ${RULE} (given "${text}")`;
      return value.deleteUndefined({ isValid, input: text, error });
    };

    if (!text) {
      return done('Scope name is empty.');
    }

    if (text.match(/[^a-zA-Z0-9_\.]/)) {
      return done('Scope name contains invalid character.');
    }

    if (!text.match(/^[a-zA-Z_\.]/)) {
      return done('Scope name starts with an invalid character.');
    }

    return done(); // Is valid.
  },
};
