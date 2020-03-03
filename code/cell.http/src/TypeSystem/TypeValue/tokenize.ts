import { t } from '../common';

export const tokenize = {
  /**
   * Splits and reads the next item (or group) chunk
   * from the given input string.
   */
  next(input: string) {
    const trimmedInput = trimPipe(input);

    const done = (args: { isGroup: boolean; text: string }): t.ITypeToken => {
      const { isGroup } = args;
      const isArray = args.text.endsWith('[]');
      const kind = !isGroup ? 'VALUE' : isArray ? 'GROUP[]' : 'GROUP';
      return {
        input,
        kind,
        text: trimParams(args.text),
        next: trimPipe(trimmedInput.substring(args.text.length)),
      };
    };

    // Group.
    const groupMatch = trimmedInput.match(/^\(.*\)(\[\])?/);
    if (Array.isArray(groupMatch)) {
      return done({ isGroup: true, text: groupMatch[0] });
    }

    // Non-group.
    const index = trimmedInput.indexOf('|');
    return done({
      isGroup: false,
      text: index < 0 ? trimmedInput : trimmedInput.substring(0, index),
    });
  },
};

/**
 * [Helpers]
 */

const trimPipe = (text: string) =>
  text
    .trim()
    .replace(/^(\s*\|\s*)/, '')
    .replace(/(\s*\|\s*)$/, '');

const trimParams = (text: string) => {
  text = text
    .trim()
    .replace(/^\(/, '')
    .replace(/\)\[\]$/, '')
    .replace(/\)$/, '');

  return text;
};
