import * as k from './types';
import { COLORS } from '../../common';

/**
 * Simple tokenizer that matches <Value> and {Object} braces.
 */
export const DefaultTokenizer: k.SyntaxLabelTokenizer = (text) => {
  text = text ?? '';
  const parts: k.SyntaxLabelToken[] = [];
  let wordBuffer = '';

  console.log('-------------------------------------------');

  const pushWord = () => {
    if (wordBuffer.length === 0) return;
    parts.push({ text: wordBuffer, color: COLORS.CYAN });
  };

  const next = factory(text);
  let done = false;

  while (!done) {
    const current = next();
    const char = current.char;
    done = current.isComplete;
    if (typeof char === 'string') {
      if (current.isBrace) {
        pushWord();
        parts.push({ text: char, color: COLORS.MAGENTA });
        wordBuffer = ''; // NB: reset.
      } else {
        wordBuffer += char;
      }
    }
  }

  pushWord(); // Clear buffer in case there were no "brace" characters.
  return { text, parts };
};

/**
 * [Internal]
 */

function factory(text: string) {
  const BRACE = ['<', '>', '{', '}'];
  let index = 0;
  let isComplete = false;

  return () => {
    const char = text[index];
    const isBrace = BRACE.includes(char);
    isComplete = index >= text.length - 1;
    index++;
    return { char, index: index - 1, isBrace, isComplete };
  };
}
