import { value } from '../common';

export const validate = {
  namespace(input: string | undefined) {
    const text = (input || '').trim();

    const done = (err?: string) => {
      const RULE = `Must be alpha-numeric, underscore (_) or period (.) and not start with a number.`;
      const isValid = !err;
      const error = isValid ? undefined : `${err} ${RULE} (given "${text}")`;
      return value.deleteUndefined({ isValid, input: text, error });
    };

    if (!text) {
      return done('Namespace ("scope") is empty.');
    }

    if (text.match(/[^a-zA-Z0-9_.]/)) {
      return done('Namespace ("scope") contains invalid character.');
    }

    if (!text.match(/^[a-zA-Z_.]/)) {
      return done('Namespace ("scope") starts with an invalid character.');
    }

    return done(); // Is valid.
  },
};
