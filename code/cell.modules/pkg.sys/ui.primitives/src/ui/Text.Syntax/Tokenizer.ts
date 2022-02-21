import * as k from './types';

type K = k.SyntaxLabelTokenKind;

/**
 * Simple tokenizer that matches <Value> and {Object} braces.
 *
 * Ref:
 *    https://github.com/microsoft/ts-parsec
 */
export const DefaultTokenizer: k.SyntaxLabelTokenizer = (text) => {
  text = text ?? '';
  const parts: k.SyntaxLabelToken[] = [];
  let buffer = '';

  const push = (kind: K, text: string) => parts.push({ text, kind });

  const pushBuffer = (kind: K) => {
    if (buffer.length === 0) return;
    push(kind, buffer);
    buffer = ''; // NB: reset.
  };

  const next = factory(text);
  let done = false;

  while (!done) {
    const current = next();
    const { char, is } = current;
    done = is.complete;
    if (typeof char !== 'string') continue;

    if (is.brace) {
      pushBuffer('Word');
      push('Brace', char);
    } else if (current.is.colon) {
      pushBuffer('Predicate');
      push('Colon', char);
    } else {
      buffer += char;
    }
  }

  pushBuffer('Word'); // Clear buffer in case there were no "brace" characters.
  return { text, parts };
};

/**
 * [Helpers]
 */

function factory(text: string) {
  let index = 0;

  return () => {
    const char = text[index];
    const is = {
      brace: ['<', '>', '{', '}', '[', ']'].includes(char),
      colon: char === ':',
      complete: index >= text.length - 1,
    };

    index++;
    return { char, index: index - 1, is };
  };
}
