export const KeyEncoding = {
  /**
   * Escapes illegal characters from a field key
   * (eg. when used in cell {links}).
   */
  escape(input: string) {
    const ILLEGAL = [':'];
    ILLEGAL.forEach((char) => {
      if (input.includes(char)) {
        throw new Error(`Link key cannot contain "${char}" character.`);
      }
    });

    // Trim surrounding "/" characters.
    input = trimSlashes(input);

    // Special escaping multi-period characters (".." => "[..]").
    const escapeMultiPeriods = (input: string): string => {
      const regex = new RegExp(/\.{2,}/g);
      const match = regex.exec(input);
      if (match && match[0]) {
        const left = input.substring(0, match.index);
        const middle = ':'.repeat(match[0].length);
        const right = input.substring(match.index + match[0].length);
        input = `${left}[${middle}]${right}`;
        return escapeMultiPeriods(input); // <== RECURSION 🌳
      } else {
        return input;
      }
    };

    input = escapeMultiPeriods(input)
      .replace(/\//g, '::') // Path seperator (/) characters escaped.
      .replace(/\./g, ':'); // Single period (.) characters escaped.
    return input;
  },

  /**
   * Converts an escaped key value back to it's original form.
   */
  unescape(input: string) {
    // Unescape the special multi-period escaping ("[..]" => "..").
    const unescapeMultiPeriods = (input: string): string => {
      const regex = new RegExp(/\[:{2,}\]/g);
      const match = regex.exec(input);
      if (match && match[0]) {
        const left = input.substring(0, match.index);
        const middle = '.'.repeat(match[0].length - 2);
        const right = input.substring(match.index + match[0].length);
        input = `${left}${middle}${right}`;
        return unescapeMultiPeriods(input); // <== RECURSION 🌳
      } else {
        return input;
      }
    };

    // Replace escaped characters.
    input = unescapeMultiPeriods(input)
      .replace(/::/g, '/') // Path seperator (/) characters escaped.
      .replace(/:/g, '.'); // Single period (.) characters escaped.
    return input;
  },
};

/**
 * Helpers
 */

function trimSlashes(input: string) {
  return (input || '').replace(/^\/*/, '').replace(/\/*$/, '');
}
