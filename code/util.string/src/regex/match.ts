import { curry } from 'ramda';

/**
 * This history of regular expressions.
 * - https://en.wikipedia.org/wiki/Regular_expression
 *
 *      A `regular expression`, `regex` or `regexp` (sometimes called a `rational expression`)
 *      is a sequence of characters that define a search pattern. Usually this pattern is used
 *      by string searching algorithms for "find" or "find and replace" operations on strings, or
 *      for input validation. It is a technique developed in theoretical computer science and
 *      formal language theory.
 *
 *      The concept arose in the [1950]s when the American mathematician `Stephen Cole Kleene`
 *      formalized the description of a regular language. The concept came into common use
 *      with Unix text-processing utilities.
 *
 */

export type IRegexMatch = {
  match: string;
  index: number;
};

function _matchAll(regex: RegExp, input: string): IRegexMatch[] {
  let list: IRegexMatch[] = [];

  let flags = '';
  flags = regex.ignoreCase ? `${flags}i` : flags;
  regex = new RegExp(regex.source, flags);

  const find = (text: string, start: number = 0) => {
    const res = regex.exec(text);
    const match = res ? res[0] : undefined;
    if (res && match) {
      list = [...list, { match, index: res.index + start }];

      // Keep looking for next occurance of pattern.
      const substringAt = res.index + match.length;
      text = text.substring(substringAt);
      if (text) {
        find(text, substringAt + start); // <== RECURSION
      }
    }
  };

  find(input);
  return list;
}

/**
 * A curryable regex matcher (with a sane response type!).
 */
export const matchAll = curry(_matchAll);
