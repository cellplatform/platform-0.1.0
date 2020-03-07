import { t } from '../common';

export const tokenize = {
  /**
   * Splits and reads the next item (or group) chunk
   * from the given input string.
   */
  next(input: string) {
    const trimmed = trimPipe(input);

    const done = (args: { isGroup: boolean; text: string }): t.ITypeToken => {
      const { isGroup } = args;
      const isArray = args.text.endsWith('[]');
      const kind = !isGroup ? 'VALUE' : isArray ? 'GROUP[]' : 'GROUP';
      return {
        input,
        kind,
        text: trimParams(args.text),
        next: trimPipe(trimmed.substring(args.text.length)),
      };
    };

    // Empty.
    if (!trimmed) {
      return done({ isGroup: false, text: '' });
    }

    // Look for a non-group first.
    const firstPipe = trimmed.indexOf('|');
    if (firstPipe > -1) {
      const text = trimmed.substring(0, firstPipe);
      if (!text.includes('(')) {
        return done({ isGroup: false, text });
      }
    }

    // Look for a group.
    const group = nextGroup(trimmed);
    if (group) {
      return done({ isGroup: true, text: group.text });
    }

    // Simple value (no "|" and no groups).
    return done({ isGroup: false, text: trimmed });
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

const trimParams = (text: string) =>
  text
    .trim()
    .replace(/^\(/, '')
    .replace(/\)\[\]$/, '')
    .replace(/\)$/, '');

const nextGroup = (input: string) => {
  let position = 0;
  let start = -1;
  let end = -1;
  let group = 0;

  do {
    const char = input[position];
    if (char === '(') {
      if (group === 0) {
        start = position;
      }
      group++;
    }
    if (char === ')') {
      if (group === 1) {
        end = position + 1;
        break;
      }
      group--;
    }
    position++;
  } while (position < input.length);

  const exists = start > -1 && end > -1;
  if (!exists) {
    return undefined;
  }

  const isArray = input.substring(end, end + 2) === '[]';
  const text = input.substring(start, end + (isArray ? 2 : 0));
  return { start, end, text };
};
